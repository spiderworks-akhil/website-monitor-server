/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `CronFrequency` will be added. If there are existing duplicate values, this will fail.
  - Made the column `userId` on table `CronFrequency` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CronFrequency" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CronFrequency_userId_key" ON "CronFrequency"("userId");

-- AddForeignKey
ALTER TABLE "CronFrequency" ADD CONSTRAINT "CronFrequency_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
