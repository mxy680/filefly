import { Module } from '@nestjs/common';
import { InferenceService } from './inference.service';
import { DocumentService } from './document/document.service';

@Module({
  providers: [InferenceService, DocumentService],
  exports: [InferenceService],
})

export class InferenceModule {

}
