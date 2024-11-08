import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './database/prisma.service';
import { ProvidersModule } from './providers/providers.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ProvidersModule,
    WebhookModule
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule { }
