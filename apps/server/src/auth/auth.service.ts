import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma.service';
import * as jwt from 'jsonwebtoken';
import { InvalidTokenException } from './exceptions/token.exception';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService, private readonly prismaService: PrismaService) { }

    async generateAccessToken(userId: number, sessionId: number): Promise<string> {
        return await this.jwtService.signAsync(
            { userId, sessionId },
            { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: '1s' }
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
        try {
            return jwt.decode(token) as { userId: number; sessionId: number };
        } catch (error) {
            throw new InvalidTokenException();
        }
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

    async isTokenExpired(token: string): Promise<{ expired: boolean, expiry?: number }> {
        try {
            // Decode and verify the token with the secret
            const decoded = jwt.decode(token, process.env.ACCESS_TOKEN_SECRET) as { exp: number };
            return { expired: false, expiry: decoded.exp };
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return { expired: true };
            }
        }

        throw new InvalidTokenException();
    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        const { userId, sessionId } = await this.decodeToken(refreshToken);

        // Generate a new access token
        const newAccessToken = await this.generateAccessToken(userId, sessionId);

        // Generate new refresh token
        const newRefreshToken = await this.generateRefreshToken(userId, sessionId);

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }
}
