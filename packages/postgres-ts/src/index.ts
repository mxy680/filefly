import { PrismaClient } from '@prisma/client';

async function fileExists(prisma: PrismaClient, userId: number, fileId: string): Promise<boolean> {
    const file = await prisma.googleDriveFile.findFirst({
        where: { userId, id: fileId }
    });

    return !!file;
}

export { fileExists };