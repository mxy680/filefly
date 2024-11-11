import { Controller, Post, Body } from '@nestjs/common';
import { ProducerService } from './producer.service';

@Controller('messages')
export class ProducerController {
  constructor(private readonly producerService: ProducerService) { }

  @Post('send')
  async sendMessage(@Body() message: any): Promise<void> {
    await this.producerService.sendMessage(message);
  }
}
