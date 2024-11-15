import { Injectable } from '@nestjs/common';
import { GoogleDriveFileVectorizable } from './types/files.types';
import { GoogleDriveProcessor } from './processors/google-drive.processor';

@Injectable()
export class VectorizationService {

    constructor(
        private readonly googleDriveProcessor: GoogleDriveProcessor,
    ) { }

    async vectorize(provider: string, file: any): Promise<void> {
        switch (provider) {
            case 'google-drive':
                await this.googleDriveProcessor.process(file as GoogleDriveFileVectorizable);
                break;
            default:
                throw new Error('Unsupported provider');
        }
    }
}
