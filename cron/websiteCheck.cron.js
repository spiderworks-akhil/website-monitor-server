import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { checkWebsites } from "../controllers/websites.controller.js";

const prisma = new PrismaClient();
let currentJob = null;

const startCronJob = (frequencyInMinutes) => {
  if (currentJob) {
    currentJob.stop();
  }
  const cronExpression = `*/${frequencyInMinutes} * * * *`;
  currentJob = cron.schedule(cronExpression, async () => {
    console.log(
      `Running scheduled website check every ${frequencyInMinutes} minute(s)...`
    );
    await checkWebsites({}, { status: () => ({ json: () => {} }) });
  });
  currentJob.start();
};

const initializeCronJob = async () => {
  try {
    let cronFreq = await prisma.cronFrequency.findUnique({ where: { id: 1 } });
    if (!cronFreq) {
      cronFreq = await prisma.cronFrequency.create({
        data: { id: 1, frequency: 1 },
      });
    }
    startCronJob(cronFreq.frequency);
  } catch (error) {
    console.error("Failed to initialize cron job:", error);
    startCronJob(1);
  }
};

export const updateCronFrequency = async (frequencyInMinutes) => {
  if (![1, 5, 10, 15, 30].includes(frequencyInMinutes)) {
    throw new Error("Invalid frequency. Must be 1, 5, 10, 15, or 30 minutes.");
  }
  await prisma.cronFrequency.upsert({
    where: { id: 1 },
    update: { frequency: frequencyInMinutes },
    create: { id: 1, frequency: frequencyInMinutes },
  });
  startCronJob(frequencyInMinutes);
};

export const getCronFrequency = async () => {
  const cronFreq = await prisma.cronFrequency.findUnique({ where: { id: 1 } });
  return cronFreq ? cronFreq.frequency : 1;
};

initializeCronJob();

export default currentJob;
