import { Injectable } from '@nestjs/common';
import { VectorizationService } from 'src/vectorization/vectorization.service';
import { ExtractionService } from 'src/extraction/extraction.service';

@Injectable()
export class ConsumerService {
  constructor(
    private readonly vectorizationService: VectorizationService,
    private readonly extractionService: ExtractionService,
  ) { }

  async handleVectorizationTask(provider: string, data: any, accessToken: string): Promise<void> {
    await this.vectorizationService.vectorize(provider, data, accessToken);
  }

  async handleExtraction(file: Buffer, mimeType: string): Promise<{ text: string, images: Buffer[] }> {
    return await this.extractionService.extract(file, mimeType);
  }
}
