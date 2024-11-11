/*
  Warnings:

  - A unique constraint covering the columns `[provider,accessToken]` on the table `Provider` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Provider_provider_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Provider_provider_accessToken_key" ON "Provider"("provider", "accessToken");
