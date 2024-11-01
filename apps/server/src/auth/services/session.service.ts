// src/auth/services/session.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class SessionService {
    constructor(private readonly prismaService: PrismaService) {}

    async initializeSession(userId: number): Promise<number> {
        return this.prismaService.session.create({
            data: {
                userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        }).then((result) => result.id);
    }

    async updateSession(accessToken: string, refreshToken: string, sessionId: number): Promise<any> {
        return this.prismaService.session.update({
            where: { id: sessionId },
            data: {
                accessToken,
                refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
    }

    async deleteSession(sessionId: number): Promise<any> {
        return this.prismaService.session.delete({ where: { id: sessionId } });
    }

    async sessionExists(sessionId: number): Promise<boolean> {
        const session = await this.prismaService.session.findUnique({ where: { id: sessionId } });
        return Boolean(session);
    }

    async isSessionActive(sessionId: number): Promise<boolean> {
        const session = await this.prismaService.session.findUnique({ where: { id: sessionId } });
        return session ? session.expiresAt > new Date() : false;
    }
}
