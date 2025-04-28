-- CreateTable
CREATE TABLE "CronFrequency" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CronFrequency_pkey" PRIMARY KEY ("id")
);
