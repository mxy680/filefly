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
}
