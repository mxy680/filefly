import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { GoogleDriveFile } from 'src/types/files';

@Injectable()
export class FilesService {
    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async createFile(userId: number, file: GoogleDriveFile) {
        await this.prismaService.googleDriveFile.create({
            data: {
                userId,
                id: file.id,
                name: file.name,
                mimeType: file.mimeType,
                webViewLink: file.webViewLink,
                thumbnailLink: file.thumbnailLink,
                iconLink: file.iconLink,
                size: Number(file.size),
                sha1: file.sha1Checksum,
                sha256: file.sha256Checksum,
                md5: file.md5Checksum,
                createdTime: new Date(file.createdTime),
                modifiedTime: new Date(file.modifiedTime),
            }
        });
    }

    async upsertFile(userId: number, file: GoogleDriveFile) {
        await this.prismaService.googleDriveFile.upsert({
            where: { id: file.id },
            update: {
                name: file.name,
                mimeType: file.mimeType,
                webViewLink: file.webViewLink,
                thumbnailLink: file.thumbnailLink,
                iconLink: file.iconLink,
                size: Number(file.size),
                sha1: file.sha1Checksum,
                sha256: file.sha256Checksum,
                md5: file.md5Checksum,
                createdTime: new Date(file.createdTime),
                modifiedTime: new Date(file.modifiedTime),
            },
            create: {
                userId,
                id: file.id,
                name: file.name,
                mimeType: file.mimeType,
                webViewLink: file.webViewLink,
                thumbnailLink: file.thumbnailLink,
                iconLink: file.iconLink,
                size: Number(file.size),
                sha1: file.sha1Checksum,
                sha256: file.sha256Checksum,
                md5: file.md5Checksum,
                createdTime: new Date(file.createdTime),
                modifiedTime: new Date(file.modifiedTime),
            }
        });
    }
}
