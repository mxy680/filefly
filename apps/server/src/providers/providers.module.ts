// src/providers/providers.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { GoogleService } from './google/google.service';
import { AuthModule } from 'src/auth/auth.module';
import { GoogleController } from './google/google.controller';

const providers = [
  ProvidersService,
  GoogleService,
];

const controllers = [
  GoogleController
];

@Module({
  imports: [forwardRef(() => AuthModule)], // Use forwardRef here
  controllers,
  providers,
  exports: [...providers],
})
export class ProvidersModule {}
