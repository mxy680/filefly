// src/providers/google-drive/google-drive.prisma.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { GoogleDriveFile } from './google-drive.types';

@Injectable()
export class GoogleDrivePrismaService {
    constructor(private readonly prisma: PrismaService) { }

    async createFile(userId: number, file: GoogleDriveFile) {
        await this.prisma.googleDriveFile.create({
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
        await this.prisma.googleDriveFile.upsert({
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

    async deleteFile(userId: number, fileId: string) {
        await this.prisma.googleDriveFile.deleteMany({
            where: { userId, id: fileId }
        });
    }

    async upsertWebhook(userId: number, channelId: string, resourceId: string, pageToken: string, accessToken: string, expiration: Date) {
        await this.prisma.googleDriveWebhook.upsert({
            where: { userId },
            update: { channelId, resourceId, pageToken, accessToken, expiration },
            create: { userId, channelId, resourceId, pageToken, accessToken, expiration }
        });
    }

    async fileWithHashExists(userId: number, hash: string, hashMethod: 'sha1' | 'sha256' | 'md5'): Promise<boolean> {
        const file = await this.prisma.googleDriveFile.findFirst({
            where: { userId, [hashMethod]: hash }
        });

        return !!file;
    }
}
