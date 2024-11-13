import { Injectable } from '@nestjs/common';
import { GoogleDriveFile as PrismaGoogleDriveFile } from '@prisma/client';
import { GoogleDriveFile } from 'src/types/files';

@Injectable()
export class DocumentService {

    async indexPdf(file: PrismaGoogleDriveFile | GoogleDriveFile): Promise<any> {
        // Extract text from the PDF
        console.log('Indexing PDF:', file.name);
    }
}

