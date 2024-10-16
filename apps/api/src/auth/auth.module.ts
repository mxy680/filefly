import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/db/db.service';
import { GoogleService } from 'src/providers/google.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersService, PrismaService, GoogleService],
})
export class AuthModule {}
