-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleDriveWebhook" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "channelId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "pageToken" TEXT NOT NULL,
    "expiration" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleDriveWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleDriveFile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "webViewLink" TEXT,
    "thumbnailLink" TEXT,
    "iconLink" TEXT,
    "size" INTEGER,
    "sha1" TEXT,
    "sha256" TEXT,
    "md5" TEXT,
    "createdTime" TIMESTAMP(3),
    "modifiedTime" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleDriveFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Provider_provider_providerId_key" ON "Provider"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_provider_accessToken_key" ON "Provider"("provider", "accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "Session_accessToken_key" ON "Session"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshToken_key" ON "Session"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleDriveWebhook_userId_key" ON "GoogleDriveWebhook"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleDriveWebhook_channelId_key" ON "GoogleDriveWebhook"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleDriveWebhook_resourceId_key" ON "GoogleDriveWebhook"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleDriveWebhook_accessToken_key" ON "GoogleDriveWebhook"("accessToken");

-- CreateIndex
CREATE INDEX "GoogleDriveWebhook_userId_accessToken_idx" ON "GoogleDriveWebhook"("userId", "accessToken");

-- CreateIndex
CREATE INDEX "GoogleDriveFile_userId_idx" ON "GoogleDriveFile"("userId");

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleDriveWebhook" ADD CONSTRAINT "GoogleDriveWebhook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleDriveFile" ADD CONSTRAINT "GoogleDriveFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
