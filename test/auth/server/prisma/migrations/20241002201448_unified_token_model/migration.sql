/*
  Warnings:

  - You are about to drop the column `tokenEncrypted` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `tokenInitVector` on the `Token` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Token_tokenEncrypted_key";

-- DropIndex
DROP INDEX "Token_tokenInitVector_key";

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "tokenEncrypted",
DROP COLUMN "tokenInitVector",
ADD COLUMN     "token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_key" ON "Token"("token");
