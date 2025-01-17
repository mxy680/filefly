import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { GoogleDriveService } from './google-drive/google-drive.service';

@Injectable()
export class ProvidersService {
    constructor(
        private prisma: PrismaService,
        private googleService: GoogleDriveService,
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

    async getProviderUser(accessToken: string, provider: string): Promise<number> {
        return await this.prisma.provider.findUnique({
            where: { provider_accessToken: { accessToken, provider } }
        }).then((result) => result.userId);
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

    async uploadData(provider: string, accessToken: string, userId: number) {        
        // Perform provider specific actions
        switch (provider) {
            case 'google':
                await this.googleService.uploadDrive(accessToken, userId);
                break;
            default:
                throw new Error('Provider not supported');
        }
    }
}
