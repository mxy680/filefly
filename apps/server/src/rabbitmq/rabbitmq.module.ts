import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'VECTORIZATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'], // Replace with your RabbitMQ URL
          queue: 'vectorization_queue',    // Ensure queue name matches
          queueOptions: { durable: true },
        },
      },
      {
        name: 'EXTRACTION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'], // Replace with your RabbitMQ URL
          queue: 'vectorization_queue',    // Ensure queue name matches
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitMQModule { }
