import { Injectable, Inject } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class ProducerService {
  constructor(private readonly amqpConnection: AmqpConnection) { }

  async sendVectorizationTask(task: { provider: string, fileId: string, accessToken: string, mimeType: string, metaData: any }): Promise<{ text: string; images: Buffer[] }> {
    try {
      return await this.amqpConnection.request<{ text: string; images: Buffer[] }>({
        exchange: 'processing-exchange',
        routingKey: 'vectorization-task',
        payload: {
          provider: task.provider,
          fileId: task.fileId,
          accessToken: task.accessToken,
          mimeType: task.mimeType,
          metaData: task.metaData,
        },
        timeout: 100000, // Timeout in milliseconds for the response
      });
    } catch (error) {
      console.error('Failed to send extraction task:', error);
      throw error;
    }
  }
}
