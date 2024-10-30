import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService, private readonly prismaService: PrismaService) { }

    async generateAccessToken(userId: number, sessionId: number): Promise<string> {
        return await this.jwtService.signAsync(
            { userId, sessionId },
            { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: '1h' }
        );
    }

    async generateRefreshToken(userId: number, sessionId: number): Promise<string> {
        return await this.jwtService.signAsync(
            { userId, sessionId },
            { secret: process.env.REFRESH_TOKEN_SECRET, expiresIn: '7d' }
        );
    }

    // Method to decode the token and retrieve sessionId
    async decodeToken(token: string): Promise<{ userId: number; sessionId: string }> {
        return this.jwtService.verify(token, { secret: process.env.ACCESS_TOKEN_SECRET });
    }

    async initializeSession(userId: number): Promise<number> {
        return await this.prismaService.session.create({
            data: {
                userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        }).then((result) => result.id);
    }

    async updateSession(accessToken: string, refreshToken: string, sessionId: number): Promise<any> {
        return await this.prismaService.session.update({
            where: { id: sessionId },
            data: {
                accessToken,
                refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });
    }

    async deleteSession(sessionId: number): Promise<any> {
        return await this.prismaService.session.delete({
            where: { id: sessionId }
        });
    }
}
