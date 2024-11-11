import { Module } from '@nestjs/common';
import { ProducerService } from './producer.service';
import { RabbitMQModule } from '../rabbitmq.module';
import { ProducerController } from './producer.controller';

@Module({
  imports: [RabbitMQModule],
  controllers: [ProducerController],
  providers: [ProducerService],
})
export class ProducerModule {}