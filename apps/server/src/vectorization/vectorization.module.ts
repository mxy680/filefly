import { Module } from '@nestjs/common';
import { VectorizationService } from './vectorization.service';
import { WeaviateModule } from 'src/weaviate/weaviate.module';
import { ProducerModule } from 'src/rabbitmq/producer/producer.module';

// Providers
import { GoogleDriveProvider } from './providers/google-drive.provider';

const providers = [
  GoogleDriveProvider,
];

// Loaders
import { GoogleDriveLoaderService } from './loaders/google-drive.loader';

const loaders = [
  GoogleDriveLoaderService,
];

// Processors
import { DocumentProcessor } from './processors/document.processor';

const processors = [
  DocumentProcessor,
]

@Module({
  imports: [WeaviateModule, ProducerModule],
  providers: [VectorizationService, ...providers, ...loaders, ...processors],
  exports: [VectorizationService]
})
export class VectorizationModule { }
