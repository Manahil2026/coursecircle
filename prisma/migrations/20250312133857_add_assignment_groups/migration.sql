-- AlterTable
ALTER TABLE "assignments" ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "assignment_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "assignment_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assignment_groups_courseId_idx" ON "assignment_groups"("courseId");

-- AddForeignKey
ALTER TABLE "assignment_groups" ADD CONSTRAINT "assignment_groups_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "assignment_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
