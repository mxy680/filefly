import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleService } from 'src/providers/google/google.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { User } from 'src/types/user';

@Controller('google')
export class GoogleController {
    constructor(private readonly googleService: GoogleService) { }

    @Get('files')
    @UseGuards(AuthGuard)
    async getUserFiles(@Req() req, @Res() res) {
        const { userId } = req.user as User;
        const files = await this.googleService.listFiles(userId);
        return res.json(files);
    }
}
