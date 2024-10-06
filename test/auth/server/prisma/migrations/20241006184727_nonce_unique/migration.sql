/*
  Warnings:

  - A unique constraint covering the columns `[nonce]` on the table `Nonce` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Nonce_nonce_key" ON "Nonce"("nonce");
