import { Module } from '@nestjs/common';
import { GoogleWebhookController } from './controllers/google-drive.webhook.controller';
import { ProvidersModule } from 'src/providers/providers.module';
import { PrismaService } from 'src/database/prisma.service';

const webhookControllers = [
  GoogleWebhookController
];

@Module({
  imports: [ProvidersModule],
  controllers: [...webhookControllers],
  providers: [PrismaService],
})
export class WebhookModule {}
