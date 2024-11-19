import { Module } from '@nestjs/common';
import { ConsumerController } from './consumer.controller';
import { ConsumerService } from './consumer.service';
import { VectorizationModule } from 'src/vectorization/vectorization.module';
import { RabbitMQModule } from '../rabbitmq.module';
import { ExtractionService } from 'src/extraction/extraction.service';

@Module({
  imports: [VectorizationModule, RabbitMQModule],
  controllers: [ConsumerController],
  providers: [ConsumerService, ExtractionService],
})
export class ConsumerModule { }
