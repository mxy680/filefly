import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { GoogleGuard } from '../../guards/google.guard';
import { AuthService } from '../../auth.service';

enum ProviderType {
  Google = 'google',
  Dropbox = 'dropbox',
}

type AuthRequest = {
  user: {
    provider: ProviderType;
    providerId: string;
    accessToken: string;
    refreshToken: string;
  };
}

@Controller('auth/google')
export class GoogleController {
  constructor(private readonly authService: AuthService) { }

  @Get('/login')
  @UseGuards(GoogleGuard)
  async googleLogin() { }

  @Get('login/callback')
  @UseGuards(GoogleGuard)
  async googleLoginCallback(@Req() req: AuthRequest, @Res() res: Response) {
    (await this.authService.onboardUser(
      res,
      req.user.provider,
      req.user.providerId,
      req.user.accessToken,
      req.user.refreshToken
    )).redirect(`${process.env.CLIENT_URL}`);
  }
}
