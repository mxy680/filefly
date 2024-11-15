import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ProducerService {
  constructor(
    @Inject('VECTORIZATION_SERVICE') private readonly client: ClientProxy,
  ) { }

  async sendVectorizationTask(task: { provider: string; data: any }): Promise<void> {
    await this.client.emit('vectorization_queue', task).subscribe({
      next: () => console.log('Vectorization task sent:', task),
      error: (error) => {
        console.error('Error sending vectorization task:', error);
        throw new Error('Failed to send vectorization task');
      },
    });
  }
}
