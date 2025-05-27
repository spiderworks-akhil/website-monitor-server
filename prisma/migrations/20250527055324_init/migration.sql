/*
  Warnings:

  - You are about to drop the column `description` on the `Dummy` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `CronFrequency` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `CronFrequency` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CronFrequency" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Dummy" DROP COLUMN "description";

-- CreateIndex
CREATE UNIQUE INDEX "CronFrequency_userId_key" ON "CronFrequency"("userId");

-- AddForeignKey
ALTER TABLE "CronFrequency" ADD CONSTRAINT "CronFrequency_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
