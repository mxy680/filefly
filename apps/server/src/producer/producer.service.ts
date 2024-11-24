import { Injectable, Inject } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class ProducerService {
  constructor(private readonly amqpConnection: AmqpConnection) { }

  async sendExtractionTask(task: { provider: string, fileId: string, accessToken: string }): Promise<{ text: string; images: Buffer[] }> {
    try {
      return await this.amqpConnection.request<{ text: string; images: Buffer[] }>({
        exchange: 'processing-exchange',
        routingKey: 'extraction-task',
        payload: {
          provider: task.provider,
          fileId: task.fileId,
          accessToken: task.accessToken,
        },
        timeout: 10000, // Timeout in milliseconds for the response
      });
    } catch (error) {
      console.error('Failed to send extraction task:', error);
      throw error;
    }
  }
}
