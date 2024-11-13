import { Module } from '@nestjs/common';
import { InferenceService } from './inference.service';
import { DocumentService } from './document/document.service';
import { WeaviateService } from 'src/weaviate/weaviate.service';
import { OcrService } from './utils/ocr.service';

@Module({
  providers: [InferenceService, DocumentService, WeaviateService, OcrService],
  exports: [InferenceService],
})

export class InferenceModule {

}
