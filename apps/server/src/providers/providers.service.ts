import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ProvidersService {
    constructor(private prisma: PrismaService) { }

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
}
