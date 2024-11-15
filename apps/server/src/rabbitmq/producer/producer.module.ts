import { Module } from '@nestjs/common';
import { ProducerService } from './producer.service';
import { RabbitMQModule } from '../rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  controllers: [],
  providers: [ProducerService],
  exports: [ProducerService],
})
export class ProducerModule {}