import { Injectable, Inject } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class ProducerService {
  constructor(private readonly amqpConnection: AmqpConnection) { }

  sendVectorizationTask(task: { provider: string, fileId: string, accessToken: string, mimeType: string, hash: string, metaData: any }) {
    try {
      this.amqpConnection.request<{ text: string, images: Buffer[] }>({
        exchange: 'processing-exchange',
        routingKey: 'vectorization-task',
        payload: {
          provider: task.provider,
          fileId: task.fileId,
          accessToken: task.accessToken,
          mimeType: task.mimeType,
          metaData: task.metaData,
          hash: task.hash,
        },
        timeout: 100000, // Timeout in milliseconds for the response
      });
    } catch (error) {
      console.error('Failed to send extraction task:', error);
      throw error;
    }
  }
}
