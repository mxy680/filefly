import { Controller, Post, Req, Res, HttpStatus, Headers } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from 'src/database/prisma.service';
import { GoogleDriveService } from 'src/providers/google-drive/google-drive.service';
import { ProvidersService } from 'src/providers/providers.service';

@Controller('webhook/google')
export class GoogleWebhookController {

  constructor(
    private readonly prismaService: PrismaService,
    private readonly googleService: GoogleDriveService,
    private readonly providerService: ProvidersService,
  ) { }

  @Post()
  async handleChange(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('X-Goog-Resource-ID') resourceId: string,
    @Headers('X-Goog-Resource-State') resourceState: string,
  ) {
    if (resourceState === 'change') {
      // Fetch the pageToken from the database
      const watch = await this.prismaService.googleDriveWebhook.findUnique({
        where: { resourceId },
      });

      if (!watch) {
        console.error('Watch not found for resource ID:', resourceId);
        return res.status(HttpStatus.NOT_FOUND).send();
      }

      const { pageToken, accessToken } = watch;

      // Fetch the actual changes
      const { changes, newPageToken } = await this.googleService.listChanges(pageToken, accessToken);

      // Get the userId using the accessToken
      const userId = await this.providerService.getProviderUser(accessToken, 'google');

      // Upload and index the changes to the database
      await this.googleService.uploadChanges(changes, userId, accessToken);

      // Update the pageToken in the database for future changes
      await this.prismaService.googleDriveWebhook.update({
        where: { resourceId },
        data: { pageToken: newPageToken },
      });
    }

    // Acknowledge the webhook notification
    res.status(HttpStatus.OK).send();
  }
}
