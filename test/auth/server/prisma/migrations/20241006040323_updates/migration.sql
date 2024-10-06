/*
  Warnings:

  - You are about to drop the column `accessToken` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - Added the required column `token` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Token` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `provider` on the `Token` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('ACCESS', 'REFRESH', 'ID');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('FILEFLY', 'GOOGLE', 'FACEBOOK', 'GITHUB');

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "accessToken",
DROP COLUMN "refreshToken",
ADD COLUMN     "token" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "TokenType" NOT NULL,
DROP COLUMN "provider",
ADD COLUMN     "provider" "Provider" NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email";
