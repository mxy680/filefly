import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-dropbox-oauth2';

@Injectable()
export class DropboxStrategy extends PassportStrategy(Strategy, 'dropbox') {
  constructor() {
    super({
      apiVersion: '2',
      clientID: process.env.DROPBOX_CLIENT_ID,
      clientSecret: process.env.DROPBOX_CLIENT_SECRET,
      callbackURL: process.env.SERVER_URL + '/auth/dropbox/login/callback',
      scopes: ['account_info.read', 'files.metadata.read'],
    });
  }

  authorizationParams(): { [key: string]: string; } {
    return ({
      token_access_type: 'offline'
    });
  };

  async validate(accessToken: string, refreshToken, profile: any, done: VerifyCallback) {    
    if (!profile) {
      done(new Error('No profile found'));
    }

    if (!accessToken || !refreshToken) {
      done(new Error('No tokens found'));
    }

    return {
      provider: 'dropbox',
      providerId: profile.id,
      accessToken,
      refreshToken,
    };
  }
}