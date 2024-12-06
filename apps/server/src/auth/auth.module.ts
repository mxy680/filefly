// src/auth/auth.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './controllers/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './strategies/google.strategy';
import { PrismaService } from 'src/database/prisma.service';
import { UsersService } from 'src/users/users.service';
import { ProvidersService } from 'src/providers/providers.service';
import { TokenService } from './services/token.service';
import { SessionService } from './services/session.service';
import { CookieService } from './services/cookie.service';
import { GoogleController } from './controllers/providers/google.controller';
import { DropboxStrategy } from './strategies/dropbox.strategy';
import { DropboxController } from './controllers/providers/dropbox.controller';
import { ProvidersModule } from 'src/providers/providers.module';

const strategies = [
  GoogleStrategy,
  DropboxStrategy
];

const services = [
  PrismaService,
  AuthService,
  UsersService,
  ProvidersService,
  TokenService,
  SessionService,
  CookieService,
];

const controllers = [
  AuthController,
  GoogleController,
  DropboxController
];

@Module({
  imports: [
    PassportModule,
    forwardRef(() => ProvidersModule), // Use forwardRef here
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [...controllers],
  providers: [...strategies, ...services],
  exports: [...strategies, ...services],
})
export class AuthModule {}
