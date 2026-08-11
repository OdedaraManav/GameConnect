-- AlterTable
ALTER TABLE "User" ADD COLUMN     "availability" TEXT NOT NULL DEFAULT 'Evenings (8:00 PM – 12:00 AM)',
ADD COLUMN     "avatar" TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
ADD COLUMN     "bio" TEXT NOT NULL DEFAULT 'Gamer on GameConnect! Ready for squad matches and casual play.',
ADD COLUMN     "location" TEXT NOT NULL DEFAULT 'Asia / India',
ADD COLUMN     "platform" TEXT NOT NULL DEFAULT 'PC',
ADD COLUMN     "playstyle" TEXT NOT NULL DEFAULT 'Casual & Competitive',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Online';
