import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:3000', // Allow requests from this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Allow all common methods
    credentials: true, // Allow cookies and credentials to be sent
  });

  // Create a microservice instance for RabbitMQ
  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'vectorization_queue',  // Make sure this matches your queue
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.listen(4000);

  // Start the microservice to listen to RabbitMQ messages
  await microservice.listen();
}
bootstrap();
