import { Controller, Get, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { DropboxGuard } from 'src/auth/guards/dropbox.guard';
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

@Controller('auth/dropbox')
export class DropboxController {
  constructor(
    private authService: AuthService,
  ) { }

  @Get('/login')
  @UseGuards(DropboxGuard)
  async dropboxLogin() { }

  @Get('login/callback')
  @UseGuards(DropboxGuard)
  async dropboxLoginCallback(@Req() req: AuthRequest, @Res() res: Response) {
    (await this.authService.onboardUser(
      res,
      req.user.provider,
      req.user.providerId,
      req.user.accessToken,
      req.user.refreshToken
    )).redirect(`${process.env.CLIENT_URL}`);
  }
}
