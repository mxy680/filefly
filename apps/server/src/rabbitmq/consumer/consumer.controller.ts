import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConsumerService } from './consumer.service';

@Controller()
export class ConsumerController {
  constructor(private readonly consumerService: ConsumerService) {}

  @MessagePattern('my_queue') // Match the queue name or routing key
  async handleIncomingMessage(@Payload() message: any) {
    console.log('Received message from RabbitMQ:', message);
    this.consumerService.processMessage(message);
  }
}
