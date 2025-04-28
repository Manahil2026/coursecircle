/*
  Warnings:

  - A unique constraint covering the columns `[studentId,assignmentId]` on the table `submissions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "submissions_studentid_assignmentid_unique" ON "public"."submissions"("studentId", "assignmentId");
