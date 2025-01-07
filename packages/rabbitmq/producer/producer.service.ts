import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { sendVectorizationTask, sendDeletionTask } from './tasks';

@Injectable()
export class ProducerService {
  constructor(private readonly amqpConnection: AmqpConnection) { }

  sendVectorizationTask(provider: string, fileId: string, userId: number): void {
    sendVectorizationTask(this.amqpConnection, provider, fileId, userId);
  }

  sendDeletionTask(provider: string, fileId: string, userId: number): void {
    sendDeletionTask(this.amqpConnection, provider, fileId, userId);
  }
}
