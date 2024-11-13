// src/providers/providers.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { GoogleService } from './google/google.service';
import { AuthModule } from 'src/auth/auth.module';
import { GoogleController } from './google/google.controller';
import { FilesService } from 'src/files/files.service';
import { ProducerModule } from 'src/rabbitmq/producer/producer.module';
import { InferenceModule } from 'src/inference/inference.module';
import { WeaviateService } from 'src/weaviate/weaviate.service';

const providers = [
  ProvidersService,
  FilesService,
  GoogleService,
  WeaviateService
];

const controllers = [
  GoogleController
];

@Module({
  imports: [forwardRef(() => AuthModule), ProducerModule, InferenceModule], // Use forwardRef here
  controllers,
  providers,
  exports: [...providers],
})
export class ProvidersModule {}
