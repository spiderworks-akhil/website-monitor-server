/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `CronFrequency` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `CronFrequency` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
CREATE SEQUENCE cronfrequency_id_seq;
ALTER TABLE "CronFrequency" ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('cronfrequency_id_seq'),
ALTER COLUMN "frequency" SET DEFAULT 5;
ALTER SEQUENCE cronfrequency_id_seq OWNED BY "CronFrequency"."id";

-- CreateIndex
CREATE UNIQUE INDEX "CronFrequency_userId_key" ON "CronFrequency"("userId");

-- AddForeignKey
ALTER TABLE "CronFrequency" ADD CONSTRAINT "CronFrequency_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
