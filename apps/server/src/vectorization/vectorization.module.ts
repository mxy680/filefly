import { Module } from '@nestjs/common';
import { VectorizationService } from './vectorization.service';
import { GoogleDriveProcessor } from './processors/google-drive.processor';

@Module({
  providers: [VectorizationService, GoogleDriveProcessor],
  exports: [VectorizationService]
})
export class VectorizationModule { }
