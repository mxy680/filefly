// src/auth/services/token.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { InvalidTokenException } from '../exceptions/token.exception';

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) { }

    async generateAccessToken(userId: number, sessionId: number): Promise<string> {
        return this.jwtService.signAsync(
            { userId, sessionId },
            { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: '1s' }
        );
    }

    async generateRefreshToken(userId: number, sessionId: number): Promise<string> {
        return this.jwtService.signAsync(
            { userId, sessionId },
            { secret: process.env.REFRESH_TOKEN_SECRET, expiresIn: '7d' }
        );
    }

    async decodeToken(token: string): Promise<{ userId: number; sessionId: number }> {
        try {
            return jwt.decode(token) as { userId: number; sessionId: number };
        } catch {
            throw new InvalidTokenException();
        }
    }

    async isTokenExpired(token: string): Promise<{ expired: boolean; expiry?: number }> {
        try {
            const decoded = jwt.decode(token, process.env.ACCESS_TOKEN_SECRET) as { exp: number };
            return { expired: false, expiry: decoded.exp };
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) return { expired: true };
        }
        throw new InvalidTokenException();
    }
}
