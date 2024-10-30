import { Module } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  providers: [ProvidersService, PrismaService],
})
export class ProvidersModule {}
