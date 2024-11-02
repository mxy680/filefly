import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DropboxGuard extends AuthGuard('dropbox') {
  constructor(private configService: ConfigService) {
    super({
      token_access_type: 'offline'
    });
  }
}
