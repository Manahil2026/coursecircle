-- AlterTable
ALTER TABLE "assignments" ADD COLUMN     "allowedAttempts" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "availableUntil" TIMESTAMP(3);
