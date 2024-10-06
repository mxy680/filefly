-- CreateTable
CREATE TABLE "Nonce" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nonce" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nonce_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Nonce" ADD CONSTRAINT "Nonce_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
