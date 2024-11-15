import { Injectable } from '@nestjs/common';

import { VectorizationService } from 'src/vectorization/vectorization.service';

@Injectable()
export class ConsumerService {
  constructor(private readonly vectorizationService: VectorizationService) { }

  async handleVectorizationTask(provider: string, data: any): Promise<void> {
    await this.vectorizationService.vectorize(provider, data);
  }
}
