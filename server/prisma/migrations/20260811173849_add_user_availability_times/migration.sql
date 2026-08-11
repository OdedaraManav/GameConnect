-- AlterTable
ALTER TABLE "User" ADD COLUMN     "availabilityEnd" TEXT NOT NULL DEFAULT '00:00',
ADD COLUMN     "availabilityStart" TEXT NOT NULL DEFAULT '20:00',
ALTER COLUMN "availability" SET DEFAULT '8:00 PM – 12:00 AM';
