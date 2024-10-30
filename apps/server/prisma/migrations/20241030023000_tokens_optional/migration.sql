-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "refreshToken" DROP NOT NULL,
ALTER COLUMN "accessToken" DROP NOT NULL;
