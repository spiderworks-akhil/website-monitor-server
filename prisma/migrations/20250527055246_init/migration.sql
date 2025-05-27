/*
  Warnings:

  - You are about to drop the column `userId` on the `CronFrequency` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CronFrequency" DROP CONSTRAINT "CronFrequency_userId_fkey";

-- DropIndex
DROP INDEX "CronFrequency_userId_key";

-- AlterTable
ALTER TABLE "CronFrequency" DROP COLUMN "userId";
