/*
  Warnings:

  - You are about to drop the column `hashed` on the `GoogleDriveFile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GoogleDriveFile" DROP COLUMN "hashed",
ADD COLUMN     "md5Checksum" TEXT,
ADD COLUMN     "sha1" TEXT,
ADD COLUMN     "sha256" TEXT;
