import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class ProducerService {
  constructor(private readonly amqpConnection: AmqpConnection) { }

  async sendVectorizationTask(
    provider: string,
    fileId: string,
    userId: number
  ): Promise<void> {
    try {
      await this.amqpConnection.request<{ text: string; images: Buffer[] }>({
        exchange: 'processing-exchange',
        routingKey: 'vectorization-task',
        payload: {
          fileId,
          userId,
          provider,
        },
        timeout: 1000000,
      });
    } catch (error) {
      console.error('Failed to send vectorization task:', error);
      throw error;
    }
  }

  async sendDeletionTask(
    provider: string,
    fileId: string,
    userId: number
  ): Promise<void> {
    try {
      await this.amqpConnection.request<{ fileId: string; userId: number; provider: string }>({
        exchange: 'processing-exchange',
        routingKey: 'deletion-task',
        payload: {
          fileId,
          userId,
          provider,
        },
        timeout: 1000000,
      });
    } catch (error) {
      console.error('Failed to send deletion task:', error);
      throw error;
    }
  }
}
