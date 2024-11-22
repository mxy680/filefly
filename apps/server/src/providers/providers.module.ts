import { Module, forwardRef } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { GoogleDriveService } from './google-drive/google-drive.service';
import { AuthModule } from 'src/auth/auth.module';
import { GoogleController } from './google-drive/google-drive.controller';
import { ProducerModule } from 'src/producer/producer.module';
import { GoogleDrivePrismaService } from './google-drive/google-drive.prisma.service';
import { GoogleDriveWebhookService } from 'src/webhook/google-drive.webhook.service';

const providers = [
  ProvidersService,
  GoogleDriveWebhookService,
  GoogleDriveService,
  GoogleDrivePrismaService,
];

const controllers = [
  GoogleController
];

@Module({
  imports: [forwardRef(() => AuthModule), ProducerModule], // Use forwardRef here
  controllers,
  providers,
  exports: [...providers],
})
export class ProvidersModule {}
