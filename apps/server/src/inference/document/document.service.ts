import { Injectable } from '@nestjs/common';
import { GoogleDriveFile as PrismaGoogleDriveFile } from '@prisma/client';
import { GoogleDriveFile } from 'src/types/files';
import { WeaviateService } from 'src/weaviate/weaviate.service';
import { OcrService } from '../utils/ocr.service';
import { drive_v3 } from 'googleapis';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class DocumentService {

    constructor(
        private readonly weaviateService: WeaviateService,
        private readonly ocrService: OcrService
    ) { }

    async indexPdf(file: PrismaGoogleDriveFile | GoogleDriveFile, drive: drive_v3.Drive, userId: Number): Promise<any> {
        // Get the file content
        const response = await drive.files.get(
            { fileId: file.id, alt: 'media' },
            { responseType: 'arraybuffer' }
        );

        const pdfBuffer = Buffer.from(response.data as ArrayBuffer);

        let content = (await pdfParse(pdfBuffer)).text;
        if (content.trim().length === 0) {
            content = await this.ocrService.extractTextFromPdf(pdfBuffer);
        }

        // Index the content in Weaviate
        return await this.weaviateService.insert('GoogleDrive', [{ content, mimeType: 'pdf', fileId: file.id, userId }], userId);
    }
}

