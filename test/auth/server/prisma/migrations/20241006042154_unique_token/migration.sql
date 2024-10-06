/*
  Warnings:

  - A unique constraint covering the columns `[userId,provider,type]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Token_userId_provider_type_key" ON "Token"("userId", "provider", "type");
