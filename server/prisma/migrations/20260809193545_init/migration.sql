-- CreateTable
CREATE TABLE "Game" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "reviewsCount" TEXT NOT NULL,
    "platforms" TEXT[],
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "featuredTag" TEXT NOT NULL,
    "releaseDate" TEXT NOT NULL,
    "developer" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "fullDescription" TEXT NOT NULL,
    "screenshots" TEXT[],

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "games" TEXT[],
    "skillLevel" TEXT NOT NULL,
    "playstyle" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "availability" TEXT NOT NULL,
    "onlineHours" TEXT NOT NULL,
    "matchPercentage" INTEGER NOT NULL,
    "region" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "compatibility" JSONB NOT NULL,
    "favoriteGameIds" INTEGER[],
    "currentlyPlayingIds" INTEGER[],
    "commonGames" TEXT[],
    "preferences" JSONB NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);
