/*
  Warnings:

  - Changed the type of `userId` on the `GoogleDriveWebhook` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "GoogleDriveWebhook" DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GoogleDriveWebhook_userId_key" ON "GoogleDriveWebhook"("userId");

-- CreateIndex
CREATE INDEX "GoogleDriveWebhook_userId_expiration_idx" ON "GoogleDriveWebhook"("userId", "expiration");

-- AddForeignKey
ALTER TABLE "GoogleDriveWebhook" ADD CONSTRAINT "GoogleDriveWebhook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
