/*
  Warnings:

  - A unique constraint covering the columns `[provider,userId]` on the table `Provider` will be added. If there are existing duplicate values, this will fail.
  - Made the column `pageToken` on table `GoogleDriveWebhook` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GoogleDriveWebhook" ALTER COLUMN "pageToken" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Provider_provider_userId_key" ON "Provider"("provider", "userId");
