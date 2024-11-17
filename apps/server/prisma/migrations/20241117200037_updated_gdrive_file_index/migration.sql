-- DropIndex
DROP INDEX "GoogleDriveWebhook_userId_expiration_idx";

-- CreateIndex
CREATE INDEX "GoogleDriveWebhook_userId_accessToken_idx" ON "GoogleDriveWebhook"("userId", "accessToken");
