import { Injectable } from '@nestjs/common';
import { GoogleDriveFileVectorizable } from 'src/types/google-drive.types';

import { GoogleDriveProvider } from 'src/vectorization/providers/google-drive.provider';

@Injectable()
export class VectorizationService {

    constructor(
        private readonly googleDriveProvider: GoogleDriveProvider,
    ) { }

    async vectorize(provider: string, file: any, accessToken: string): Promise<void> {
        switch (provider) {
            case 'google-drive':
                await this.googleDriveProvider.process(file as GoogleDriveFileVectorizable, accessToken);
                break;
            default:
                throw new Error('Unsupported provider');
        }
    }
}
