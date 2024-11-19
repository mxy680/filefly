import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConsumerService } from './consumer.service';

@Controller()
export class ConsumerController {
  constructor(private readonly consumerService: ConsumerService) {}
  
  @MessagePattern('vectorization_queue')  // Matches the pattern used by the producer
  async handleVectorizationTask(@Payload() task: { provider: string, data: any, accessToken: string }): Promise<void> {
    await this.consumerService.handleVectorizationTask(task.provider, task.data, task.accessToken);
  }

  @MessagePattern('extraction_queue')  // Matches the pattern used by the producer
  async handleExtraction(@Payload() task: { file: Buffer, mimeType: string }): Promise<{ text: string, images: Buffer[] }> {
    return await this.consumerService.handleExtraction(task.file, task.mimeType);
  }
}
