import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { GoogleService } from './google/google.service';

@Injectable()
export class ProvidersService {
    constructor(
        private prisma: PrismaService,
        private googleService: GoogleService
    ) { }

    async updateProviderTokens(providerId: string, provider: string, accessToken: string, refreshToken: string): Promise<void> {
        await this.prisma.provider.update({
            where: { provider_providerId: { providerId, provider } },
            data: { accessToken, refreshToken }
        })
    }

    async createProvider(userId: number, providerId: string, provider: string, accessToken: string, refreshToken: string): Promise<number> {
        return await this.prisma.provider.create({
            data: { userId, providerId, provider, accessToken, refreshToken }
        }).then((result) => result.id);
    }

    async setupWebhook(provider: string, accessToken: string, userId: number) {
        switch (provider) {
            case 'google':
                await this.googleService.startWatchingChanges(accessToken, userId);
                break;
            default:
                throw new Error('Provider not supported');
        }
    }

    async retrieveData(provider: string, accessToken: string, userId: number) {
        switch (provider) {
            case 'google':
                await this.googleService.listFiles(accessToken, userId);
                break;
            default:
                throw new Error('Provider not supported');
        }
    }
}
