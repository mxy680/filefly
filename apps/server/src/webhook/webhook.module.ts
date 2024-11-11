import { Module } from '@nestjs/common';
import { GoogleWebhookController } from './controllers/google.webhook.controller';
import { ProvidersModule } from 'src/providers/providers.module';
import { PrismaService } from 'src/database/prisma.service';
import { FilesService } from 'src/files/files.service';

const webhookControllers = [
  GoogleWebhookController
];

@Module({
  imports: [ProvidersModule],
  controllers: [...webhookControllers],
  providers: [PrismaService, FilesService],
})
export class WebhookModule {}
