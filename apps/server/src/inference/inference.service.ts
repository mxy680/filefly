import { Injectable } from '@nestjs/common';
import { GoogleDriveFile as PrismaGoogleDriveFile } from '@prisma/client';
import { DocumentService } from './document/document.service';
import { GoogleDriveFile } from 'src/types/files';

@Injectable()
export class InferenceService {

    constructor(private readonly documentService: DocumentService) { }

    async index(file: PrismaGoogleDriveFile | GoogleDriveFile): Promise<any> {
        const fileType = file.mimeType;

        switch (fileType) {
            case 'application/pdf':
                await this.documentService.indexPdf(file); 
                break;
            default:
                throw new Error('Unsupported file type');
        }
    }
}
