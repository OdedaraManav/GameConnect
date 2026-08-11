-- CreateTable
CREATE TABLE "UserFavoriteGame" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFavoriteGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPlayingGame" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPlayingGame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserFavoriteGame_userId_idx" ON "UserFavoriteGame"("userId");

-- CreateIndex
CREATE INDEX "UserFavoriteGame_gameId_idx" ON "UserFavoriteGame"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFavoriteGame_userId_gameId_key" ON "UserFavoriteGame"("userId", "gameId");

-- CreateIndex
CREATE INDEX "UserPlayingGame_userId_idx" ON "UserPlayingGame"("userId");

-- CreateIndex
CREATE INDEX "UserPlayingGame_gameId_idx" ON "UserPlayingGame"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPlayingGame_userId_gameId_key" ON "UserPlayingGame"("userId", "gameId");

-- AddForeignKey
ALTER TABLE "UserFavoriteGame" ADD CONSTRAINT "UserFavoriteGame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavoriteGame" ADD CONSTRAINT "UserFavoriteGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlayingGame" ADD CONSTRAINT "UserPlayingGame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlayingGame" ADD CONSTRAINT "UserPlayingGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
