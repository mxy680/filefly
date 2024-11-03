import { Injectable } from '@nestjs/common';
import { GoogleService } from 'src/providers/google/google.service';

@Injectable()
export class WebhookService {
    constructor(private readonly googleService: GoogleService) { }

    async setupWebhook(provider: string, accessToken: string, userId: number) {
        switch (provider) {
            case 'google':
                await this.googleService.startWatchingChanges(accessToken, userId);
                break;
            default:
                throw new Error('Provider not supported');
        }
    }
}
