import { Controller, Get, Post, HttpCode, UseGuards, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard } from '../guards/auth.guard';

// Services
import { SessionService } from '../services/session.service';
import { AuthService } from '../auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
  ) { }

  @Post('refresh')
  async refreshAccessToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await this.authService.refreshToken(refreshToken);
    this.authService.setCookies(res, newAccessToken, newRefreshToken);

    return res.json({ message: 'Tokens refreshed' });
  }

  @Post('clear-cookies')
  @HttpCode(200)
  async clearCookies(@Res() res: Response) {
    this.authService.clearCookies(res);
    return res.json({ message: 'Cookies cleared' });
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async logout(@Req() req: Request, @Res() res: Response) {
    // Get the session ID from the request middleware extraction
    const { sessionId } = req.user as { sessionId: number };
    await this.sessionService.deleteSession(sessionId);
    this.authService.clearCookies(res);

    // Send a success message
    return res.json({ message: 'Logged out successfully' });
  }
}

