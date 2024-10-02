/*
  Warnings:

  - You are about to drop the column `token` on the `AccessToken` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `RefreshToken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenEncrypted]` on the table `AccessToken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tokenInitVector]` on the table `AccessToken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tokenEncrypted]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tokenInitVector]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tokenEncrypted` to the `AccessToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenInitVector` to the `AccessToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenEncrypted` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenInitVector` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AccessToken_token_key";

-- DropIndex
DROP INDEX "RefreshToken_token_key";

-- AlterTable
ALTER TABLE "AccessToken" DROP COLUMN "token",
ADD COLUMN     "tokenEncrypted" TEXT NOT NULL,
ADD COLUMN     "tokenInitVector" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "token",
ADD COLUMN     "tokenEncrypted" TEXT NOT NULL,
ADD COLUMN     "tokenInitVector" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AccessToken_tokenEncrypted_key" ON "AccessToken"("tokenEncrypted");

-- CreateIndex
CREATE UNIQUE INDEX "AccessToken_tokenInitVector_key" ON "AccessToken"("tokenInitVector");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenEncrypted_key" ON "RefreshToken"("tokenEncrypted");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenInitVector_key" ON "RefreshToken"("tokenInitVector");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
