import { Controller, Post, Req, Res, HttpStatus, Headers } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('webhook/google')
export class GoogleWebhookController {

  @Post()
  async handleChange(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('X-Goog-Channel-ID') channelId: string,
    @Headers('X-Goog-Resource-ID') resourceId: string,
    @Headers('X-Goog-Resource-State') resourceState: string,
    @Headers('X-Goog-Message-Number') messageNumber: string,
  ) {
    // Verify the headers from Google to confirm the source of the webhook
    console.log('Received notification:', {
      channelId,
      resourceId,
      resourceState,
      messageNumber,
    });

    // Handle the change notification here (e.g., update database, process change)
    // Example: if (resourceState === 'exists') { handleChange(resourceId); }

    // Send a response to acknowledge receipt of the notification
    res.status(HttpStatus.OK).send();
  }
}
