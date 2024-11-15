import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleDriveService } from './google-drive.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('google')
export class GoogleController {
    constructor(
        private readonly googleService: GoogleDriveService,
    ) { }
}
