import { Injectable } from '@nestjs/common';

import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from 'src/database/prisma.service';
import { GoogleDrivePrismaService } from './google-drive.prisma.service';

import { GoogleDriveFile } from './google-drive.types'; // For Prisma Schema
import { ProducerService } from 'src/producer/producer.service';

@Injectable()
export class GoogleDriveService {
    constructor(
        private readonly prismaFileService: GoogleDrivePrismaService,
        private readonly producerService: ProducerService,
    ) { }

    getDrive(accessToken: string): { drive: drive_v3.Drive; client: OAuth2Client } {
        const client = new OAuth2Client();
        client.setCredentials({ access_token: accessToken });
        const drive = google.drive({ version: 'v3', auth: client });
        return { drive, client };
    }

    async upload(file: GoogleDriveFile, userId: number): Promise<void> {
        const fileHashExists = await this.prismaFileService.fileWithHashExists(userId, file?.sha256Checksum, 'sha256');
        if (!fileHashExists) {
            // Try to create the file 
            try {
                await this.prismaFileService.createFile(userId, file as GoogleDriveFile);
            } catch (error) {
                if (error.code === 'P2002') {
                    // File already exists, assume deduplication
                    return;
                }
            }

            console.log('Uploading file to Weaviate:', file.id);
            // Assume file is new and needs to be uploaded
            this.producerService.sendVectorizationTask('google', file.id, userId);
        }
    }

    async delete(file: GoogleDriveFile, userId: number): Promise<void> {
        // Check if the file exists 
        const fileExists = await this.prismaFileService.fileExists(userId, file.id);
        if (!fileExists) {
            return;
        }

        // Delete from weaviate db
        console.log('Deleting file from Weaviate:', file.id);
        this.producerService.sendDeletionTask('google', file.id, userId);
    }

    async uploadDrive(accessToken: string, userId: number) {
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

                await this.upload(file.data as GoogleDriveFile, userId);
            }));

        } catch (error) {
            console.error('Error retrieving files:', error.message);
            throw new Error('Failed to retrieve Google Drive files');
        }
    }

    async uploadChanges(changes: drive_v3.Schema$Change[], userId: number, accessToken: string) {
        if (changes.length === 0) {
            return;
        }

        await Promise.all(changes.map(async (change) => {
            const { file, removed, changeType } = change;

            // Ensure file data is available
            if (changeType === 'file') {
                if (removed || file?.trashed) {
                    // File is permanently deleted or access was revoked
                    await this.delete(file as GoogleDriveFile, userId);
                }
                else {
                    // File was added or modified
                    await this.upload(file as GoogleDriveFile, userId);
                }
            }
        }));
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
                supportsAllDrives: true,
                requestBody: {
                    id: channelId,
                    type: 'web_hook',
                    address: `${process.env.NGROK_URL}/webhook/google`,
                    expiration: expiration.getTime().toString(),
                }
            });

            const resourceId = response.data.resourceId;

            if (!resourceId) {
                throw new Error("Resource ID is missing in the response");
            }

            // Upsert the webhook in the database
            await this.prismaFileService.upsertWebhook(userId, channelId, resourceId, pageToken, accessToken, expiration);

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
}

