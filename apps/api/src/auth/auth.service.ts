import { Injectable } from '@nestjs/common';
import { GoogleService } from 'src/providers/google.service';

@Injectable()
export class AuthService {
    constructor(private googleService: GoogleService) { }

    async signIn(provider: string) {
        return this.googleService.signIn();
    }
}
