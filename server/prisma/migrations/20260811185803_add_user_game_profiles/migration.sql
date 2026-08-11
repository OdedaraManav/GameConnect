-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('SELF_REPORTED', 'VERIFIED');

-- CreateTable
CREATE TABLE "UserGameProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "gamerTag" TEXT NOT NULL,
    "gameAccountId" TEXT,
    "rank" TEXT,
    "tier" TEXT,
    "level" INTEGER,
    "platform" TEXT,
    "region" TEXT,
    "stats" JSONB,
    "isAccountConnected" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'SELF_REPORTED',
    "verifiedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "verificationSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGameProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserGameProfile_userId_idx" ON "UserGameProfile"("userId");

-- CreateIndex
CREATE INDEX "UserGameProfile_gameId_idx" ON "UserGameProfile"("gameId");

-- CreateIndex
CREATE INDEX "UserGameProfile_verificationStatus_idx" ON "UserGameProfile"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "UserGameProfile_userId_gameId_key" ON "UserGameProfile"("userId", "gameId");

-- AddForeignKey
ALTER TABLE "UserGameProfile" ADD CONSTRAINT "UserGameProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGameProfile" ADD CONSTRAINT "UserGameProfile_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
