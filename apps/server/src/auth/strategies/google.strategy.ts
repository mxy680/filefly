import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:4000/auth/google/login/callback',
      scope: ['email', 'profile', 'openid', 'https://www.googleapis.com/auth/drive'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    if (!profile) {
      done(new Error('No profile found'));
    }

    if (!accessToken || !refreshToken) {
      done(new Error('No tokens found'));
    }

    return {
      provider: 'google',
      providerId: profile.id,
      accessToken,
      refreshToken,
    };
  }
}