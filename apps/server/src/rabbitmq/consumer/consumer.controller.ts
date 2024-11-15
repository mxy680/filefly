import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConsumerService } from './consumer.service';

@Controller()
export class ConsumerController {
  constructor(private readonly consumerService: ConsumerService) {}
  

  @MessagePattern('vectorization_queue')  // Matches the pattern used by the producer
  async handleVectorizationTask(@Payload() task: { provider: string, data: any }): Promise<void> {
    console.log('Received vectorization task:');
    await this.consumerService.handleVectorizationTask(task.provider, task.data);
  }
}
