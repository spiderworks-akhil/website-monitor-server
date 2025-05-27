-- DropForeignKey
ALTER TABLE "CronFrequency" DROP CONSTRAINT "CronFrequency_userId_fkey";

-- DropIndex
DROP INDEX "CronFrequency_userId_key";
