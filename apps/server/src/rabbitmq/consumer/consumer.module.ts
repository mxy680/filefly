import { Module } from '@nestjs/common';
import { ConsumerController } from './consumer.controller';
import { ConsumerService } from './consumer.service';
import { VectorizationModule } from 'src/vectorization/vectorization.module';
import { RabbitMQModule } from '../rabbitmq.module';

@Module({
  imports: [VectorizationModule, RabbitMQModule],
  controllers: [ConsumerController],
  providers: [ConsumerService],
})
export class ConsumerModule { }
