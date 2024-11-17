import { Module } from '@nestjs/common';
import { VectorizationService } from './vectorization.service';
import { GoogleDriveProcessor } from './processors/google-drive.processor';
import { WeaviateModule } from 'src/weaviate/weaviate.module';

@Module({
  imports: [WeaviateModule],
  providers: [VectorizationService, GoogleDriveProcessor],
  exports: [VectorizationService]
})
export class VectorizationModule { }
