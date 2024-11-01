import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.SERVER_URL + '/auth/github/login/callback',
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
      provider: 'github',
      providerId: profile.id,
      accessToken,
      refreshToken,
    };
  }
}