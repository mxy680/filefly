import { Controller, Get, Req, Res, UseGuards, HttpStatus } from '@nestjs/common';
import { GoogleDriveService } from './google-drive.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Request, Response } from 'express';
import { GoogleDriveWebhookService } from 'src/webhook/google-drive.webhook.service';

@Controller('google')
export class GoogleController {
    constructor(
        private readonly googleService: GoogleDriveService,
        private readonly googleWebhookService: GoogleDriveWebhookService,
    ) { }

    @Get('changes')
    @UseGuards(AuthGuard)
    async listChanges(
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const { userId } = req.user as { userId: number };

        // Get the webhook
        const webhook = await this.googleWebhookService.getWebhookByUser(userId);

        if (!webhook) {
            return res.status(HttpStatus.NOT_FOUND).send();
        }

        // Get the google access token
        const googleAccessToken = await this.googleWebhookService.getAccessToken(userId);

        // Fetch the actual changes
        const { changes, newPageToken } = await this.googleService.listChanges(webhook.pageToken, googleAccessToken);

        // Update the pageToken in the database for future changes
        await this.googleWebhookService.updateWebhookPageToken(webhook.resourceId, newPageToken);

        // Upload and index the changes to the database
        await this.googleService.uploadChanges(changes, userId, googleAccessToken);

        return res.status(HttpStatus.OK).json(changes);
    }
}
