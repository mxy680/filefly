// src/providers/google/google.service.ts
import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GoogleService {
    async startWatchingChanges(accessToken: string, userId: number) {
        const auth = new OAuth2Client();
        auth.setCredentials({ access_token: accessToken });

        const drive = google.drive({ version: 'v3', auth });

        try {
            const pageTokenResponse = await drive.changes.getStartPageToken();
            const pageToken = pageTokenResponse.data.startPageToken;

            if (!pageToken) {
                throw new Error('Failed to retrieve startPageToken');
            }

            const channelId = uuidv4();

            const response = await drive.changes.watch({
                pageToken,
                requestBody: {
                    id: channelId,
                    type: 'web_hook',
                    address: 'https://example.com/webhook',
                    expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        .getTime()
                        .toString(),
                }
            });

            const resourceId = response.data.resourceId;

            if (!resourceId) {
                throw new Error("Resource ID is missing in the response");
            }

            console.log(`Created Google Drive webhook for user ${userId}`);
        } catch (error) {
            console.error('Error starting Google Drive watch:', error);
            throw new Error('Failed to start Google Drive watch');
        }
    }
}
