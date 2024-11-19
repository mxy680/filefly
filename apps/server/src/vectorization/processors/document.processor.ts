import { Injectable } from '@nestjs/common';

import { ProducerService } from 'src/rabbitmq/producer/producer.service';

@Injectable()
export class DocumentProcessor {

    constructor(
        private readonly producerService: ProducerService
    ) { }

    async process(content: Buffer | string, mimeType: string): Promise<void> {
        if (typeof content === 'string') {
            // TODO
        } else {
            let { images, text } = await this.producerService.sendExtractionTask({ file: content, mimeType });
            console.log('Extracted text:', text);
            console.log('Extracted images:', images);
        }
    }
}
