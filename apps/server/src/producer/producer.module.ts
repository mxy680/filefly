import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ProducerService } from './producer.service';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'ocr-exchange',
          type: 'direct',
        },
      ],
      uri: 'amqp://user:password@localhost:5672', // Replace with your RabbitMQ connection string
      connectionInitOptions: { wait: false },
    }),
  ],
  providers: [ProducerService],
  exports: [ProducerService],
})
export class ProducerModule {}
