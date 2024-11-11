import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleService } from 'src/providers/google/google.service';
import { FilesService } from 'src/files/files.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { User } from 'src/types/user';

@Controller('google')
export class GoogleController {
    constructor(
        private readonly googleService: GoogleService,
        private readonly fileService: FilesService,
    ) { }

    @Get('files')
    @UseGuards(AuthGuard)
    async getUserFiles(@Req() req, @Res() res) {
        const { userId } = req.user as User;
        const files = await this.fileService.listFiles(userId);
        return res.json(files);
    }
}
