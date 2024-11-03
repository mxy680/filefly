-- CreateTable
CREATE TABLE "GoogleDriveFile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "webViewLink" TEXT,
    "createdTime" TIMESTAMP(3),
    "modifiedTime" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleDriveFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoogleDriveFile_userId_idx" ON "GoogleDriveFile"("userId");

-- AddForeignKey
ALTER TABLE "GoogleDriveFile" ADD CONSTRAINT "GoogleDriveFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
