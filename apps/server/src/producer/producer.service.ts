import { Injectable, Inject } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class ProducerService {
  constructor(private readonly amqpConnection: AmqpConnection) { }

  sendVectorizationTask(provider: string, fileId: string, userId: number): void {
    try {
      this.amqpConnection.request<{ text: string, images: Buffer[] }>({
        exchange: 'processing-exchange',
        routingKey: 'vectorization-task',
        payload: {
          fileId: fileId,
          userId: userId,
          provider: provider
        },
        timeout: 1000000
      });
    } catch (error) {
      console.error('Failed to send extraction task:', error);
      throw error;
    }
  }
}
