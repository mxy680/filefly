import { Controller, Get, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { DropboxGuard } from 'src/auth/guards/dropbox.guard';
import { AuthService } from '../../auth.service';
import { UsersService } from 'src/users/users.service';
import { CookieService } from '../../services/cookie.service';
import { AuthenticatedRequest } from '../../types/request.interface';
import { ProvidersService } from 'src/providers/providers.service';

@Controller('auth/dropbox')
export class DropboxController {
  constructor(
    private authService: AuthService,
    private cookieService: CookieService,
    private userService: UsersService,
    private providerService: ProvidersService
  ) {}

  @Get('/login')
  @UseGuards(DropboxGuard)
  async dropboxLogin() { }

  @Get('login/callback')
  @UseGuards(DropboxGuard)
  async dropboxLoginCallback(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    // Find User if they exist
    let userId: number;
    userId = await this.userService.findUser(req.user.providerId, req.user.provider);

    if (userId) {
      // User has already authenticated this provider
      // Update Provider Tokens
      await this.providerService.updateProviderTokens(
        req.user.providerId,
        req.user.provider,
        req.user.accessToken,
        req.user.refreshToken
      );
    } else {
      // User has not authenticated this provider
      // Create User and Provider
      userId = await this.userService.createUser();

      await this.providerService.createProvider(
        userId,
        req.user.providerId,
        req.user.provider,
        req.user.accessToken,
        req.user.refreshToken
      );
    }

    // Ensure user exists
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    // Onboard user
    const { accessToken, refreshToken } = await this.authService.onboardUser(userId);

    // Set cookies
    this.cookieService.setCookie(res, 'accessToken', accessToken, {
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    this.cookieService.setCookie(res, 'refreshToken', refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend
    res.redirect(`${process.env.CLIENT_URL}`);
  }
}
