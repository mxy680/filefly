import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = request.cookies['accessToken'];

        if (!token) {
            throw new UnauthorizedException('No access token provided');
        }

        // Decode the token to get userId and sessionId
        const { userId, sessionId } = await this.authService.decodeToken(token);

        // Verify if the session is valid in the database
        const sessionExists = await this.authService.sessionExists(sessionId);
        if (!sessionExists) {
            throw new UnauthorizedException('Invalid session');
        }

        // Check if the session is still active
        const sessionActive = await this.authService.isSessionActive(sessionId);
        if (!sessionActive) {
            // Delete the session if it has expired
            await this.authService.deleteSession(sessionId);
            throw new UnauthorizedException('Session expired');
        }

        // Check if the access token is expired
        const tokenExpired = await this.authService.isTokenExpired(token);
        if (tokenExpired) {
            throw new UnauthorizedException('Access token expired');
        }

        // Attach user details to the request object for use in other parts of the app
        request.user = { userId, sessionId, accessToken: token };

        return true;
    }
}
