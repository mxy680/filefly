import { Injectable } from '@nestjs/common';
import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'src/database/prisma.service';
import { GoogleDriveFile } from 'src/types/files';

@Injectable()
export class GoogleService {
    constructor(private readonly prismaService: PrismaService) { }

    getDrive(accessToken: string): { drive: drive_v3.Drive; client: OAuth2Client } {
        const client = new OAuth2Client();
        client.setCredentials({ access_token: accessToken });
        const drive = google.drive({ version: 'v3', auth: client });
        return { drive, client };
    }

    async uploadFiles(accessToken: string, userId: number): Promise<drive_v3.Schema$File[]> {
        const { drive } = this.getDrive(accessToken);

        try {
            const response = await drive.files.list({
                pageSize: 100, // Adjust as needed
                fields: 'files(id, name, mimeType)', // Specify fields to retrieve
                q: 'trashed = false', // Exclude files in the trash
            });

            // Create the files in the database (user was just created)
            await Promise.all(response.data.files.map(async (file: drive_v3.Schema$File) => {
                // Upsert the file in the database
                await this.prismaService.googleDriveFile.create({
                    data: {
                        userId,
                        id: file.id,
                        name: file.name,
                        mimeType: file.mimeType,
                    }
                });
            }));

            return response.data.files || [];
        } catch (error) {
            console.error('Error retrieving files:', error.message);
            throw new Error('Failed to retrieve Google Drive files');
        }
    }

    async listFiles(userId: number): Promise<GoogleDriveFile[]> {
        try {
            const files = await this.prismaService.googleDriveFile.findMany({
                where: { userId }
            });

            return files || [];
        } catch (error) {
            console.error('Error retrieving files:', error.message);
            throw new Error('Failed to retrieve Google Drive files');
        }
    }

    async startWatchingChanges(accessToken: string, userId: number) {
        const { drive } = this.getDrive(accessToken);

        try {
            const pageTokenResponse = await drive.changes.getStartPageToken();
            const pageToken = pageTokenResponse.data.startPageToken;

            if (!pageToken) {
                throw new Error('Failed to retrieve startPageToken');
            }

            const channelId = uuidv4();
            const expiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            const response = await drive.changes.watch({
                pageToken,
                requestBody: {
                    id: channelId,
                    type: 'web_hook',
                    address: `${process.env.NGROK_URL}/webhook/google`,
                    expiration: expiration.getTime().toString()
                }
            });

            const resourceId = response.data.resourceId;

            if (!resourceId) {
                throw new Error("Resource ID is missing in the response");
            }

            // Upsert the webhook in the database
            await this.prismaService.googleDriveWebhook.upsert({
                where: { userId },
                update: { channelId, resourceId, pageToken, accessToken, expiration },
                create: { userId, channelId, resourceId, pageToken, accessToken, expiration }
            });

        } catch (error) {
            console.error('Error starting Google Drive watch:', error);
            throw new Error('Failed to start Google Drive watch');
        }
    }

    async listChanges(pageToken: string, accessToken: string) {
        // Set access token for authenticated requests
        const { drive } = this.getDrive(accessToken);

        try {
            // Make a request to get changes
            const res = await drive.changes.list({
                pageToken: pageToken,
                fields: '*',
                includeRemoved: true,
            });

            const changes = res.data.changes;
            const newPageToken = res.data.newStartPageToken;

            return { changes, newPageToken };
        } catch (error) {
            throw new Error('Failed to fetch changes');
        }
    }

    async uploadChanges(changes: drive_v3.Schema$Change[], userId: number) {
        if (changes.length === 0) {
            return;
        }

        await Promise.all(changes.map(async (change) => {
            const { file, removed, changeType } = change;

            // Ensure file data is available
            if (changeType === 'file') {
                if (removed || file?.trashed) {
                    console.log('File was removed:', file?.id);
                    // File is permanently deleted or access was revoked
                    await this.prismaService.googleDriveFile.deleteMany({
                        where: { id: file?.id, userId },
                    });
                }
                else {
                    // File was added or modified
                    await this.prismaService.googleDriveFile.upsert({
                        where: { id: file.id },
                        update: {
                            name: file.name,
                            mimeType: file.mimeType,
                            webViewLink: file.webViewLink,
                            createdTime: new Date(file.createdTime),
                            modifiedTime: new Date(file.modifiedTime),
                        },
                        create: {
                            userId,
                            id: file.id,
                            name: file.name,
                            mimeType: file.mimeType,
                            webViewLink: file.webViewLink,
                            createdTime: new Date(file.createdTime),
                            modifiedTime: new Date(file.modifiedTime),
                        },
                    });
                }
            }
        }));
    }
}
