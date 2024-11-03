/*
  Warnings:

  - Changed the type of `provider` on the `Provider` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('google', 'dropbox');

-- AlterTable
ALTER TABLE "Provider" DROP COLUMN "provider",
ADD COLUMN     "provider" "ProviderType" NOT NULL;

-- CreateTable
CREATE TABLE "GoogleDriveWebhook" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "expiration" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleDriveWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleDriveWebhook_userId_key" ON "GoogleDriveWebhook"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleDriveWebhook_channelId_key" ON "GoogleDriveWebhook"("channelId");

-- CreateIndex
CREATE INDEX "GoogleDriveWebhook_userId_expiration_idx" ON "GoogleDriveWebhook"("userId", "expiration");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_provider_providerId_key" ON "Provider"("provider", "providerId");
