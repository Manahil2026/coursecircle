/*
  Warnings:

  - A unique constraint covering the columns `[studentId,courseId,date]` on the table `attendances` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "attendances_studentId_courseId_date_key" ON "attendances"("studentId", "courseId", "date");
