import { Injectable } from '@nestjs/common';
import { GoogleDriveFileVectorizable } from 'src/types/google-drive.types';

import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { GoogleDriveLoaderService } from '../loaders/google-drive.loader';

import { GOOGLE_DRIVE_DOCUMENT_MIME_TYPES } from 'src/types/google-drive.types';

import { DocumentProcessor } from '../processors/document.processor';

@Injectable()
export class GoogleDriveProvider {

    constructor(
        private readonly googleDriveLoaderService: GoogleDriveLoaderService,
        private readonly documentProcessor: DocumentProcessor,
    ) { }

    getDrive(accessToken: string): { drive: drive_v3.Drive; client: OAuth2Client } {
        const client = new OAuth2Client();
        client.setCredentials({ access_token: accessToken });
        const drive = google.drive({ version: 'v3', auth: client });
        return { drive, client };
    }

    async process(file: GoogleDriveFileVectorizable, accessToken: string): Promise<void> {
        // Create google drive instance
        const { drive } = this.getDrive(accessToken);

        if (GOOGLE_DRIVE_DOCUMENT_MIME_TYPES.includes(file.mimeType as any)) {
            const { content, mimeType } = await this.googleDriveLoaderService.loadFile(drive, file.fileId, file.mimeType);
            await this.documentProcessor.process(content, mimeType);
        }
    }
}
