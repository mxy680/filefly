import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class GoogleService {
    constructor(private readonly prismaService: PrismaService) { }

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
