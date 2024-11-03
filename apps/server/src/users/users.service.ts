import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ProvidersService } from 'src/providers/providers.service';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private providerService: ProvidersService
    ) { }

    async findUser(providerId: string, provider: string): Promise<number> {
        return await this.prisma.provider.findUnique({
            where: { provider_providerId: { providerId, provider } },
            select: { userId: true }
        }).then((result) => result?.userId);
    }

    async createUser(): Promise<number> {
        return await this.prisma.user.create({
            data: {}
        }).then((result) => result.id);
    }

    async onboardUser(provider: string, providerId: string, accessToken: string, refreshToken: string): Promise<number> {
        let userId: number;
        userId = await this.findUser(providerId, provider);
        if (!userId) {
            // User has not authenticated this provider
            userId = await this.createUser();
            await this.providerService.createProvider(
                userId,
                providerId,
                provider,
                accessToken,
                refreshToken
            );
        } else {
            // User has already authenticated this provider
            // Update Provider Tokens
            await this.providerService.updateProviderTokens(
                providerId,
                provider,
                accessToken,
                refreshToken
            );
        }

        // Ensure user exists
        if (!userId) {
            throw new UnauthorizedException('User not found');
        }

        return userId;
    }
}
