import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubGuard extends AuthGuard('github') {
    constructor(private configService: ConfigService) {
        super();
    }
}
