/*
  Warnings:

  - Added the required column `source` to the `flashcards` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "flashcards" ADD COLUMN     "source" TEXT NOT NULL;
