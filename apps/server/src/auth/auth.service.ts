// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { TokenService } from './services/token.service';
import { SessionService } from './services/session.service';
import { CookieService } from './services/cookie.service';
import { UsersService } from 'src/users/users.service';
import { WebhookService } from 'src/webhook/webhook.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly tokenService: TokenService,
        private readonly sessionService: SessionService,
        private readonly cookieService: CookieService,
        private readonly userService: UsersService,
        private readonly webhookService: WebhookService
    ) { }

    async onboardUser(
        res: Response,
        provider: string,
        providerId: string,
        providerAccessToken: string,
        providerRefreshToken: string): Promise<Response> {

        // Onboard the user or log them in
        const userId = await this.userService.onboardUser(
            provider,
            providerId,
            providerAccessToken,
            providerRefreshToken
        );

        // Initialize a new session
        const sessionId = await this.sessionService.initializeSession(userId);
        const sessionAccessToken = await this.tokenService.generateAccessToken(userId, sessionId);
        const sessionRefreshToken = await this.tokenService.generateRefreshToken(userId, sessionId);
        await this.sessionService.updateSession(sessionAccessToken, sessionRefreshToken, sessionId);
        this.setCookies(res, sessionAccessToken, sessionRefreshToken);

        // Setup Webhook
        await this.webhookService.setupWebhook(provider, providerAccessToken, userId);

        return res;
    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        if (!refreshToken) {
            throw new UnauthorizedException('No refresh token provided');
        }

        try {
            const { userId, sessionId } = await this.tokenService.decodeToken(refreshToken);

            // Generate a new access and refresh token
            const newAccessToken = await this.tokenService.generateAccessToken(userId, sessionId);
            const newRefreshToken = await this.tokenService.generateRefreshToken(userId, sessionId);

            await this.sessionService.updateSession(newAccessToken, newRefreshToken, sessionId);

            return { accessToken: newAccessToken, refreshToken: newRefreshToken };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async clearCookies(res: Response) {
        this.cookieService.clearCookie(res, 'accessToken');
        this.cookieService.clearCookie(res, 'refreshToken');
    }

    async setCookies(res: Response, newAccessToken: string, newRefreshToken: string) {
        this.cookieService.setCookie(res, 'accessToken', newAccessToken, {
            maxAge: 60 * 60 * 1000, // 1 hour
        });

        this.cookieService.setCookie(res, 'refreshToken', newRefreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }
}
