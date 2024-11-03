import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { GoogleWebhookController } from './controllers/google.webhook.controller';
import { GoogleService } from 'src/providers/google/google.service';
import { ProvidersModule } from 'src/providers/providers.module';

const webhookControllers = [
  GoogleWebhookController
];

@Module({
  imports: [ProvidersModule],
  controllers: [...webhookControllers],
  providers: [WebhookService],
})
export class WebhookModule {}
