// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { TokenService } from './services/token.service';
import { SessionService } from './services/session.service';
import { CookieService } from './services/cookie.service';
import { UsersService } from 'src/users/users.service';
import { ProvidersService } from 'src/providers/providers.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly tokenService: TokenService,
        private readonly sessionService: SessionService,
        private readonly cookieService: CookieService,
        private readonly userService: UsersService,
        private readonly providerService: ProvidersService
    ) { }

    async onboardUser(
        res: Response,
        provider: string,
        providerId: string,
        providerAccessToken: string,
        providerRefreshToken: string): Promise<Response> {

        let userId: number;
        userId = await this.userService.findUser(providerId, provider);
        const newUser = !userId;
        if (!userId) {
            // User has not authenticated this provider
            userId = await this.userService.createUser();
            await this.providerService.createProvider(
                userId,
                providerId,
                provider,
                providerAccessToken,
                providerRefreshToken
            );
        } else {
            // User has already authenticated this provider
            // Update Provider Tokens
            await this.providerService.updateProviderTokens(
                providerId,
                provider,
                providerAccessToken,
                providerRefreshToken
            );
        }

        // Ensure user exists
        if (!userId) {
            throw new UnauthorizedException('User not found');
        }

        // Initialize a new session
        const sessionId = await this.sessionService.initializeSession(userId);
        const sessionAccessToken = await this.tokenService.generateAccessToken(userId, sessionId);
        const sessionRefreshToken = await this.tokenService.generateRefreshToken(userId, sessionId);
        await this.sessionService.updateSession(sessionAccessToken, sessionRefreshToken, sessionId);
        this.setCookies(res, sessionAccessToken, sessionRefreshToken);

        if (newUser) {
            // Setup Webhook
            await this.providerService.setupWebhook(provider, providerAccessToken, userId);

            // Retrieve Files from Provider
            await this.providerService.retrieveData(provider, providerAccessToken, userId);
        }

        // Send the files back in the response
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
