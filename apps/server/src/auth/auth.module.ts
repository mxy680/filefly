import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './controllers/auth.controller';
import { UsersModule } from 'src/users/users.module';
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
import { GithubStrategy } from './strategies/github.strategy';
import { GithubController } from './controllers/providers/github.controller';

const strategies = [
  GoogleStrategy, 
  GithubStrategy
];

const services = [
  PrismaService, 
  AuthService, 
  UsersService, 
  ProvidersService, 
  TokenService, 
  SessionService,
  CookieService
];

const controllers = [
  AuthController,
  GoogleController, 
  GithubController
];

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '60s' },
    })
  ],
  controllers: [...controllers],
  providers: [...strategies, ...services],
})

export class AuthModule { }
