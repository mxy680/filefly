import { Module } from '@nestjs/common';
import { VectorizationService } from './vectorization.service';
import { WeaviateModule } from 'src/weaviate/weaviate.module';

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
  imports: [WeaviateModule],
  providers: [VectorizationService, ...providers, ...loaders, ...processors],
  exports: [VectorizationService]
})
export class VectorizationModule { }
