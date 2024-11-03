import { Module } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { PrismaService } from 'src/database/prisma.service';
import { GoogleService } from './google/google.service';

const servicesImport = [
  ProvidersService, 
  PrismaService,
];

const servicesExport = [
  GoogleService,
];

@Module({
  providers: [...servicesImport, ...servicesExport],
  exports: [...servicesExport],
})
export class ProvidersModule {}
