import { Module } from '@nestjs/common';
import { GoogleWebhookController } from './controllers/google.webhook.controller';

const webhookControllers = [
  GoogleWebhookController
];

@Module({
  controllers: [...webhookControllers],
  providers: [],
})
export class WebhookModule {}
