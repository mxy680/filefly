/*
  Warnings:

  - A unique constraint covering the columns `[resourceId]` on the table `GoogleDriveWebhook` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accessToken]` on the table `GoogleDriveWebhook` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accessToken` to the `GoogleDriveWebhook` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GoogleDriveWebhook" ADD COLUMN     "accessToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GoogleDriveWebhook_resourceId_key" ON "GoogleDriveWebhook"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleDriveWebhook_accessToken_key" ON "GoogleDriveWebhook"("accessToken");
