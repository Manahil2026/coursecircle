-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_professorId_fkey";

-- AlterTable
ALTER TABLE "courses" ALTER COLUMN "professorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
