import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ProducerService {
  constructor(
    @Inject('VECTORIZATION_SERVICE') private readonly vectorizationClient: ClientProxy,
    @Inject('EXTRACTION_SERVICE') private readonly extractionClient: ClientProxy,
  ) { }

  async sendVectorizationTask(task: { provider: string; data: any; accessToken: string }): Promise<void> {
    await this.vectorizationClient.emit('vectorization_queue', task).subscribe({
      error: (error) => {
        console.error('Error sending vectorization task:', error);
        throw new Error('Failed to send vectorization task');
      },
    });
  }

  async sendExtractionTask(task: { file: Buffer; mimeType: string }): Promise<{ text: string; images: Buffer[] }> {
    try {
      return await lastValueFrom(
        this.extractionClient.send<{ text: string; images: Buffer[] }>('extraction_queue', task)
      );
    } catch (error) {
      console.error('Error sending Extraction task:', error);
      throw new Error('Failed to send Extraction task');
    }
  }
}
