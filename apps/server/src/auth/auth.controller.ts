import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { GoogleGuard } from './guards/google.guard';
import { UsersService } from 'src/users/users.service';
import { ProvidersService } from 'src/providers/providers.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UsersService,
    private providerService: ProvidersService,
    private authService: AuthService
  ) { }

  @Get('google/login')
  @UseGuards(GoogleGuard)
  async googleLogin() { /* This route will redirect to Google for authentication */ }

  @Get('google/login/callback')
  @UseGuards(GoogleGuard)
  async googleLoginCallback(@Req() req, @Res() res: Response) {
    // Find User if they exist
    let userId = await this.userService.findUser(req.user.providerId, req.user.provider);

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

    // Ensure user exists (userId is a number)
    if (typeof userId !== 'number') {
      throw new Error('User ID is not a number');
    }

    // Create tokens
    const accessToken = await this.authService.generateAccessToken(userId);
    const refreshToken = await this.authService.generateRefreshToken(userId);

    // Create session for user
    await this.authService.createSession(accessToken, refreshToken, userId);

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000, // 1h in milliseconds
      sameSite: 'lax',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7d in milliseconds
      sameSite: 'lax',
    });

    // Redirect to frontend
    res.redirect(`${process.env.CLIENT_URL}`);
  }
}
