import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // Create the main HTTP application
  const app = await NestFactory.create(AppModule);

  // Middleware for cookies
  app.use(cookieParser());

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000', // Allow requests from this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Allow all common methods
    credentials: true, // Allow cookies and credentials to be sent
  });

  // Start the main HTTP application
  await app.listen(4000);
  console.log('HTTP server running on http://localhost:4000');
}

bootstrap();
