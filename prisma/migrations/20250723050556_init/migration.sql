/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Standard', 'Manager', 'Admin');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'Standard';
