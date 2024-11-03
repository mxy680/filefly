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
            });

            // Create the files in the database (user was just created)
            await Promise.all(response.data.files.map(async (file: drive_v3.Schema$File) => {
                await this.prismaService.googleDriveFile.create({
                    data: {
                        userId,
                        id: file.id,
                        name: file.name,
                        mimeType: file.mimeType
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
                update: { channelId, resourceId, expiration },
                create: { userId, channelId, resourceId, expiration }
            });

        } catch (error) {
            console.error('Error starting Google Drive watch:', error);
            throw new Error('Failed to start Google Drive watch');
        }
    }
}
