/*
  Warnings:

  - Changed the type of `provider` on the `Provider` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Provider" DROP COLUMN "provider",
ADD COLUMN     "provider" TEXT NOT NULL;

-- DropEnum
DROP TYPE "ProviderType";

-- CreateIndex
CREATE UNIQUE INDEX "Provider_provider_providerId_key" ON "Provider"("provider", "providerId");
