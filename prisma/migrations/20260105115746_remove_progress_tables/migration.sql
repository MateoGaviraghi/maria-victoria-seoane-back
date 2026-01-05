/*
  Warnings:

  - You are about to drop the `course_progress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lesson_progress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "course_progress" DROP CONSTRAINT "course_progress_courseId_fkey";

-- DropForeignKey
ALTER TABLE "course_progress" DROP CONSTRAINT "course_progress_userId_fkey";

-- DropForeignKey
ALTER TABLE "lesson_progress" DROP CONSTRAINT "lesson_progress_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "lesson_progress" DROP CONSTRAINT "lesson_progress_userId_fkey";

-- DropTable
DROP TABLE "course_progress";

-- DropTable
DROP TABLE "lesson_progress";
