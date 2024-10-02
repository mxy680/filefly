/*
  Warnings:

  - You are about to drop the column `jwtToken` on the `Session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[jwtRefreshToken]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jwtRefreshToken` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Session_jwtToken_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "jwtToken",
ADD COLUMN     "jwtRefreshToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Session_jwtRefreshToken_key" ON "Session"("jwtRefreshToken");
