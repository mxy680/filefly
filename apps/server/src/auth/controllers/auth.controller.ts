import { Controller, Get, Post, HttpCode, UseGuards, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { RequestUser } from 'src/auth/types/user.interface';
import { AuthGuard } from '../guards/auth.guard';

// Services
import { SessionService } from '../services/session.service';
import { AuthService } from '../auth.service';
import { CookieService } from '../services/cookie.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private cookieService: CookieService,
  ) { }

  @Get('check')
  @UseGuards(AuthGuard)
  async check(@Res() res: Response) {
    return res.status(200).json({ authenticated: true });
  }

  @Post('refresh')
  async refreshAccessToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    try {
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await this.authService.refreshToken(refreshToken);

      // Use CookieService to set cookies
      this.cookieService.setCookie(res, 'accessToken', newAccessToken, {
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      this.cookieService.setCookie(res, 'refreshToken', newRefreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.json({ message: 'Tokens refreshed' });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('clear-cookies')
  @HttpCode(200)
  async clearCookies(@Res() res: Response) {
    this.cookieService.clearCookie(res, 'accessToken');
    this.cookieService.clearCookie(res, 'refreshToken');
    return res.json({ message: 'Cookies cleared' });
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async logout(@Req() req: Request, @Res() res: Response) {
    // Get the session ID from the request middleware extraction
    const sessionId = (req.user as RequestUser).sessionId;

    // Delete the session
    await this.sessionService.deleteSession(sessionId);

    // Clear the cookies
    this.cookieService.clearCookie(res, 'accessToken');
    this.cookieService.clearCookie(res, 'refreshToken');

    // Send a success message
    return res.json({ message: 'Logged out successfully' });
  }
}

