/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Nonce` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Nonce_userId_key" ON "Nonce"("userId");
