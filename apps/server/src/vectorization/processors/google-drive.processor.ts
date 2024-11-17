import { Injectable } from '@nestjs/common';
import { GoogleDriveFileVectorizable } from '../types/files.types';

import { extractTextFromImage, extractTextFromPdf } from '../utils/ocr';

import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as pdfParse from 'pdf-parse';
import { WeaviateService } from 'src/weaviate/weaviate.service';

@Injectable()
export class GoogleDriveProcessor {

    constructor(private readonly weaviateService: WeaviateService) { }

    getDrive(accessToken: string): { drive: drive_v3.Drive; client: OAuth2Client } {
        const client = new OAuth2Client();
        client.setCredentials({ access_token: accessToken });
        const drive = google.drive({ version: 'v3', auth: client });
        return { drive, client };
    }

    async process(file: GoogleDriveFileVectorizable, accessToken: string): Promise<void> {
        // Create google drive instance
        const { drive } = this.getDrive(accessToken);

        console.log(file.mimeType);

        return;

        let content;
        switch (file.mimeType) {
            case 'application/pdf':
                content = await this.pdf(file, drive);
                break;
            case 'image/png':
            case 'image/jpeg':
            case 'image/jpg':
                content = await this.image(file, drive);
                console.log('Content:', content);
                break;
            default:
                console.error('Unsupported file type:', file.mimeType);
                throw new Error('Unsupported file type');
        }

        // Send the content to the vectorization service
        await this.weaviateService.insert('GoogleDrive', [{ content, mimeType: 'pdf', fileId: file.fileId, userId: file.userId.toString() }], file.userId);
    }

    async pdf(file: GoogleDriveFileVectorizable, drive: drive_v3.Drive): Promise<string> {
        const response = await drive.files.get(
            { fileId: file.fileId, alt: 'media' },
            { responseType: 'arraybuffer' }
        );

        const pdfBuffer = Buffer.from(response.data as ArrayBuffer);

        let content = (await pdfParse(pdfBuffer)).text;
        if (content.trim().length === 0) {
            content = await extractTextFromPdf(pdfBuffer);
        }

        return content;
    }

    async image(file: GoogleDriveFileVectorizable, drive: drive_v3.Drive): Promise<string> {
        const response = await drive.files.get(
            { fileId: file.fileId, alt: 'media' },
            { responseType: 'arraybuffer' }
        );

        const imageBuffer = Buffer.from(response.data as ArrayBuffer);

        return await extractTextFromImage(imageBuffer);
    }
}
