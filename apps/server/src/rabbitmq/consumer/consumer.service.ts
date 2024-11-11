import { Injectable } from '@nestjs/common';

@Injectable()
export class ConsumerService {
  processMessage(data: any) {
    // Logic to handle the message
    console.log('Processing message:', data);
  }
}
