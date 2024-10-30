import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService, private readonly prismaService: PrismaService) { }

    async generateAccessToken(userId: number): Promise<string> {
        return await this.jwtService.signAsync(
            { userId },
            { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: '1h' }
        );
    }

    async generateRefreshToken(userId: number): Promise<string> {
        return await this.jwtService.signAsync(
            { userId },
            { secret: process.env.REFRESH_TOKEN_SECRET, expiresIn: '7d' }
        );
    }

    async createSession(accessToken: string, refreshToken: string, userId: number): Promise<any> {
        return await this.prismaService.session.create({
            data: {
                accessToken,
                refreshToken,
                userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });
    }
}
