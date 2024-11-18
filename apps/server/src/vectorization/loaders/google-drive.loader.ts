import { Injectable } from '@nestjs/common';
import { google, drive_v3 } from 'googleapis';

@Injectable()
export class GoogleDriveLoaderService {

    async loadFile(drive: drive_v3.Drive, fileId: string, mimeType: string): Promise<{ content: Buffer | string; mimeType: string }> {
        if (mimeType.startsWith('application/vnd.google-apps')) {
            return this.loadGoogleAppsFile(drive, fileId, mimeType);
        } else {
            return this.loadRegularFile(drive, fileId, mimeType);
        }
    }

    private async loadGoogleAppsFile(drive: drive_v3.Drive, fileId: string, mimeType: string): Promise<{ content: string; mimeType: string }> {
        let exportMimeType: string;

        switch (mimeType) {
            case 'application/vnd.google-apps.document': // Google Docs
                exportMimeType = 'application/pdf';
                break;
            case 'application/vnd.google-apps.spreadsheet': // Google Sheets
                exportMimeType = 'text/csv';
                break;
            case 'application/vnd.google-apps.presentation': // Google Slides
                exportMimeType = 'application/pdf';
                break;
            default:
                throw new Error(`Unsupported Google Workspace MIME type: ${mimeType}`);
        }

        const response = await drive.files.export(
            {
                fileId,
                mimeType: exportMimeType,
            },
            { responseType: 'stream' }
        );

        let content = '';
        await new Promise<void>((resolve, reject) => {
            response.data
                .on('data', (chunk) => (content += chunk))
                .on('end', resolve)
                .on('error', reject);
        });

        return { content, mimeType: exportMimeType };
    }

    private async loadRegularFile(drive: drive_v3.Drive, fileId: string, mimeType: string): Promise<{ content: Buffer; mimeType: string }> {

        const response = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'arraybuffer' }
        );

        return {
            content: Buffer.from(response.data as ArrayBuffer),
            mimeType: mimeType,
        };
    }
}
