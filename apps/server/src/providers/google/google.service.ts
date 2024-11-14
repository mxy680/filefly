import { Injectable } from '@nestjs/common';

import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from 'src/database/prisma.service';
import { FilesService } from 'src/files/files.service';
import { InferenceService } from 'src/inference/inference.service';

import { GoogleDriveFile } from 'src/types/files';
import { GoogleDriveFile as PrismaGoogleDriveFile } from '@prisma/client';

@Injectable()
export class GoogleService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly fileService: FilesService,
        private readonly inferenceService: InferenceService
    ) { }

    getDrive(accessToken: string): { drive: drive_v3.Drive; client: OAuth2Client } {
        const client = new OAuth2Client();
        client.setCredentials({ access_token: accessToken });
        const drive = google.drive({ version: 'v3', auth: client });
        return { drive, client };
    }

    async uploadFiles(accessToken: string, userId: number): Promise<void> {
        const { drive } = this.getDrive(accessToken);

        try {
            const response = await drive.files.list({
                fields: 'files(id, name, mimeType)', // Specify fields to retrieve
                q: 'trashed = false', // Exclude files in the trash
            });

            // Create the files in the database (user was just created)
            await Promise.all(response.data.files.map(async (fileResponse: drive_v3.Schema$File) => {
                const file = await drive.files.get({
                    fileId: fileResponse.id,
                    fields: '*',
                });

                await this.fileService.createFile(userId, file.data as GoogleDriveFile);
            }));


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

    async uploadChanges(changes: drive_v3.Schema$Change[], userId: number, accessToken: string) {
        if (changes.length === 0) {
            return;
        }

        const { drive } = this.getDrive(accessToken);

        await Promise.all(changes.map(async (change) => {
            const { file, removed, changeType } = change;

            // Ensure file data is available
            if (changeType === 'file') {
                if (removed || file?.trashed) {
                    // File is permanently deleted or access was revoked
                    await this.prismaService.googleDriveFile.deleteMany({
                        where: { id: file?.id, userId },
                    });
                }
                else {
                    // Check if file hash exists 
                    const fileHashExists = await this.fileService.fileWithHashExists(userId, file?.sha256Checksum, 'sha256');
                    if (!fileHashExists) {
                        console.log('File hash does not exist, uploading file:', file?.name);
                        await this.fileService.upsertFile(userId, file as GoogleDriveFile);
                        await this.inferenceService.index(change.file as GoogleDriveFile, drive, userId);
                    }
                }
            }
        }));
    }

    async indexDrive(accessToken: string, userId: number) {
        try {
            const { drive } = this.getDrive(accessToken);
            // Get user's files
            const files = await this.prismaService.googleDriveFile.findMany({
                where: { userId },
            });

            // Index files
            await Promise.all(files.map(async (file: PrismaGoogleDriveFile) => {
                await this.inferenceService.index(file, drive, userId);
            }));
        } catch (error) {
            console.error('Error indexing files:', error.message);
            throw new Error('Failed to index files');
        }
    }
}

