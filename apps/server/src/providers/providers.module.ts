import { Module } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { PrismaService } from 'src/database/prisma.service';
import { GoogleService } from './google/google.service';

const providers = [
  ProvidersService,
  GoogleService
];

@Module({
  providers: [...providers, PrismaService],
  exports: [...providers]
})

export class ProvidersModule {}
