import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { NoTokenProvidedException, TokenExpiredException, InvalidTokenException, SessionExpiredException, SessionDoesNotExistException } from '../exceptions/token.exception';
import { TokenService } from '../services/token.service';
import { SessionService } from '../services/session.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly tokenService: TokenService, private readonly sessionService: SessionService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = request.cookies['accessToken'];

        if (!token) {
            throw new NoTokenProvidedException();
        }

        // Check if the token is expired
        const { expired, expiry } = await this.tokenService.isTokenExpired(token);
        if (expired) throw new TokenExpiredException();

        let userId: number;
        let sessionId: number;

        try {
            ({ userId, sessionId } = await this.tokenService.decodeToken(token));
        } catch (error) {
            throw new InvalidTokenException();
        }

        // Check if session exists and is active
        const sessionExists = await this.sessionService.sessionExists(sessionId);
        if (!sessionExists) throw new SessionDoesNotExistException();

        const sessionActive = await this.sessionService.isSessionActive(sessionId);
        if (!sessionActive) {
            await this.sessionService.deleteSession(sessionId);
            throw new SessionExpiredException();
        }

        request.user = { userId, sessionId, accessToken: token };

        return true;
    }
}
