/*
  Warnings:

  - You are about to drop the column `content` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `resources` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `lessons` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "content",
DROP COLUMN "resources",
DROP COLUMN "videoUrl";
