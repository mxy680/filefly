import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma.service';
import * as jwt from 'jsonwebtoken';

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
    async decodeToken(token: string): Promise<{ userId: number; sessionId: number }> {
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

    async sessionExists(sessionId: number): Promise<boolean> {
        const session = await this.prismaService.session.findUnique({
            where: { id: sessionId }
        });
        return session ? true : false;
    }

    async isSessionActive(sessionId: number): Promise<boolean> {
        const session = await this.prismaService.session.findUnique({
            where: { id: sessionId }
        });
        return session.expiresAt > new Date();
    }

    async isTokenExpired(token: string): Promise<boolean> {
        try {
            // Decode and verify the token with the secret
            await this.decodeToken(token);
            return false; // Token is valid and not expired
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return true; // Token is expired
            }
            throw new UnauthorizedException('Invalid token'); // Other errors (e.g., malformed token)
        }
    }
}
