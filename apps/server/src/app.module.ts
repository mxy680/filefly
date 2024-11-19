import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './database/prisma.service';
import { ProvidersModule } from './providers/providers.module';
import { WebhookModule } from './webhook/webhook.module';
import { ProducerModule } from './rabbitmq/producer/producer.module';
import { ConsumerModule } from './rabbitmq/consumer/consumer.module';
import { WeaviateModule } from './weaviate/weaviate.module';
import { VectorizationModule } from './vectorization/vectorization.module';
import { ExtractionModule } from './extraction/extraction.module';

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
    WeaviateModule,
    VectorizationModule,
    ExtractionModule,
  ],
  
  providers: [PrismaService],
})
export class AppModule { }
