import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Request, Response } from 'express';
import { NoTokenProvidedException, TokenExpiredException, InvalidTokenException, SessionExpiredException, SessionDoesNotExistException } from '../exceptions/token.exception';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = request.cookies['accessToken'];

        if (!token) {
            throw new NoTokenProvidedException();
        }

        // Check if the token is expired
        const { expired, expiry } = await this.authService.isTokenExpired(token);
        if (expired) throw new TokenExpiredException();

        let userId: number;
        let sessionId: number;

        try {
            ({ userId, sessionId } = await this.authService.decodeToken(token));
        } catch (error) {
            throw new InvalidTokenException();
        }

        // Check if session exists and is active
        const sessionExists = await this.authService.sessionExists(sessionId);
        if (!sessionExists) throw new SessionDoesNotExistException();

        const sessionActive = await this.authService.isSessionActive(sessionId);
        if (!sessionActive) {
            await this.authService.deleteSession(sessionId);
            throw new SessionExpiredException();
        }

        request.user = { userId, sessionId, accessToken: token };

        return true;
    }
}
