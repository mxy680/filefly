import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/database/prisma.service';
import { ProvidersService } from 'src/providers/providers.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, ProvidersService],
})
export class UsersModule {}
