import { Injectable } from '@nestjs/common';
import { GoogleDriveFile as PrismaGoogleDriveFile } from '@prisma/client';

@Injectable()
export class DocumentService {

    async indexPdf(file: PrismaGoogleDriveFile): Promise<any> {
        // Extract text from the PDF
        return 'PDF text';
    }
}
