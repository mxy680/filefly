import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ProducerService {
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy
  ) { }

  async sendMessage(message: any): Promise<void> {
    // Emit the message to the queue; the first argument is the pattern (routing key)
    await this.client.emit('my_queue', message).subscribe({
      next: () => console.log('Message sent:', message),
      error: (error) => {
        console.error('Error sending message:', error);
        throw new Error('Failed to send message');
      },
    });
  }
}
