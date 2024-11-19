import { Module } from '@nestjs/common';
import { ExtractionService } from './extraction.service';

@Module({
  controllers: [],
  providers: [ExtractionService],
})
export class ExtractionModule {}
