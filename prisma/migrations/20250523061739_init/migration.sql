-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('BASIC', 'PREMIUM');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "user_type" "UserType" NOT NULL DEFAULT 'BASIC';
