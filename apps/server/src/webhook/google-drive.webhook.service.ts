import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class GoogleDriveWebhookService {
    constructor(private readonly prismaService: PrismaService) { }

    async getWebhookByResource(resourceId: string) {
        return this.prismaService.googleDriveWebhook.findUnique({
            where: { resourceId },
        });
    }

    async getWebhookByUser(userId: number) {
        return this.prismaService.googleDriveWebhook.findFirst({
            where: { userId: userId },
        });
    }

    async updateWebhookPageToken(resourceId: string, pageToken: string) {
        return this.prismaService.googleDriveWebhook.update({
            where: { resourceId },
            data: { pageToken },
        });
    }

    async getAccessToken(userId: number): Promise<string> { 
        const { accessToken } = await this.prismaService.googleDriveWebhook.findFirst({
            where: { userId },
        });

        return accessToken;
    }
}