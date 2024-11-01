// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { TokenService } from './services/token.service';
import { SessionService } from './services/session.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly tokenService: TokenService,
        private readonly sessionService: SessionService,
    ) {}

    async onboardUser(userId: number): Promise<{ accessToken: string; refreshToken: string }> {
        const sessionId = await this.sessionService.initializeSession(userId);
        const accessToken = await this.tokenService.generateAccessToken(userId, sessionId);
        const refreshToken = await this.tokenService.generateRefreshToken(userId, sessionId);

        await this.sessionService.updateSession(accessToken, refreshToken, sessionId);

        return { accessToken, refreshToken };
    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        const { userId, sessionId } = await this.tokenService.decodeToken(refreshToken);

        // Generate a new access and refresh token
        const newAccessToken = await this.tokenService.generateAccessToken(userId, sessionId);
        const newRefreshToken = await this.tokenService.generateRefreshToken(userId, sessionId);

        await this.sessionService.updateSession(newAccessToken, newRefreshToken, sessionId);

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }
}
