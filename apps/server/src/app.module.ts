import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './database/prisma.service';
import { ProvidersModule } from './providers/providers.module';
import { WebhookModule } from './webhook/webhook.module';
import { ProducerModule } from './rabbitmq/producer/producer.module';
import { ConsumerModule } from './rabbitmq/consumer/consumer.module';
import { InferenceModule } from './inference/inference.module';
import { WeaviateModule } from './weaviate/weaviate.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ProvidersModule,
    WebhookModule,
    ProducerModule,
    ConsumerModule,
    InferenceModule,
    WeaviateModule,
  ],
  
  providers: [PrismaService],
})
export class AppModule { }
