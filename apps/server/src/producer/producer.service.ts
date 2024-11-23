import { Injectable, Inject } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class ProducerService {
  constructor(private readonly amqpConnection: AmqpConnection) { }

  async sendVectorizationTask(task: { provider: string; data: any; accessToken: string }): Promise<void> {
    try {
      await this.amqpConnection.publish('processing-exchange', 'vectorization-task', {
        provider: task.provider,
        data: task.data,
        accessToken: task.accessToken,
      });
      console.log('Vectorization task sent successfully:', task);
    } catch (error) {
      console.error('Failed to send vectorization task:', error);
      throw error;
    }
  }

  async sendExtractionTask(task: { provider: string; data: any; accessToken: string }): Promise<{ text: string; images: Buffer[] }> {
    try {
      const response = await this.amqpConnection.request<{ text: string; images: Buffer[] }>({
        exchange: 'processing-exchange',
        routingKey: 'extraction-task',
        payload: {
          provider: task.provider,
          data: task.data,
          accessToken: task.accessToken,
        },
        timeout: 10000, // Timeout in milliseconds for the response
      });

      console.log('Extraction task response received:', response);
      return response;
    } catch (error) {
      console.error('Failed to send extraction task:', error);
      throw error;
    }
  }
}
