/*
  Warnings:

  - You are about to drop the column `md5Checksum` on the `GoogleDriveFile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GoogleDriveFile" DROP COLUMN "md5Checksum",
ADD COLUMN     "md5" TEXT;
