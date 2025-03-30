-- CreateEnum
CREATE TYPE "SubmissionType" AS ENUM ('NO_SUBMISSIONS', 'ONLINE');

-- CreateEnum
CREATE TYPE "OnlineSubmissionMethod" AS ENUM ('TEXT_ENTRY', 'FILE_UPLOAD');

-- AlterTable
ALTER TABLE "assignments" ADD COLUMN     "onlineSubmissionMethod" "OnlineSubmissionMethod",
ADD COLUMN     "submissionType" "SubmissionType" NOT NULL DEFAULT 'NO_SUBMISSIONS';
