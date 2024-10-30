/*
  Warnings:

  - You are about to drop the column `refreshTokenHashed` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `sessionTokenHashed` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "refreshTokenHashed",
DROP COLUMN "sessionTokenHashed";
