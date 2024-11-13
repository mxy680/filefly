import { Injectable } from '@nestjs/common';
import { GoogleDriveFile as PrismaGoogleDriveFile } from '@prisma/client';
import { DocumentService } from './document/document.service';
import { GoogleDriveFile } from 'src/types/files';
import { drive_v3 } from 'googleapis';

@Injectable()
export class InferenceService {

    constructor(private readonly documentService: DocumentService) { }

    async index(file: PrismaGoogleDriveFile | GoogleDriveFile, drive: drive_v3.Drive, userId: Number): Promise<void> {
        switch (file.mimeType) {
            case 'application/pdf':
                await this.documentService.indexPdf(file, drive, userId); 
                break;
            default:
                throw new Error('Unsupported file type');
        }
    }
}
