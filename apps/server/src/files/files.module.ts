import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { PrismaService } from 'src/database/prisma.service';
import { ProvidersModule } from 'src/providers/providers.module';

@Module({
  imports: [ProvidersModule],
  controllers: [],
  providers: [FilesService, PrismaService],
})

export class FilesModule {}
