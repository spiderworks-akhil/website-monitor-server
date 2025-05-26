import cron from "node-cron";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const userCronJobs = new Map();

export const startUserCronJob = (userId, frequency) => {
  if (userCronJobs.has(userId)) {
    userCronJobs.get(userId).stop();
  }

  const cronExpr = `*/${frequency} * * * *`;
  const job = cron.schedule(cronExpr, async () => {
    console.log(
      `Running website check for user ${userId} every ${frequency} mins`
    );
    await checkWebsitesForUser(userId);
  });

  job.start();
  userCronJobs.set(userId, job);
};

console.log(userCronJobs);

export const initializeAllUserCronJobs = async () => {
  const frequencies = await prisma.cronFrequency.findMany();
  for (const freq of frequencies) {
    startUserCronJob(freq.userId, freq.frequency);
  }
};

export const updateUserCronFrequency = async (userId, frequency) => {
  if (![1, 5, 10, 15, 30].includes(frequency)) {
    throw new Error("Invalid frequency. Must be 1, 5, 10, 15, or 30 minutes.");
  }

  await prisma.cronFrequency.upsert({
    where: { userId },
    update: { frequency },
    create: { userId, frequency },
  });

  startUserCronJob(userId, frequency);
};

export const getUserCronFrequency = async (userId) => {
  const freq = await prisma.cronFrequency.findUnique({ where: { userId } });
  return freq ? freq.frequency : 5;
};

export const checkWebsitesForUser = async (userId) => {
  const websites = await prisma.website.findMany({ where: { userId } });

  for (const site of websites) {
    let status = "Fail";

    try {
      const start = Date.now();
      await axios.get(site.url, {
        timeout: 5000,
        httpsAgent: agent,
      });
      const responseTime = Date.now() - start;
      status = responseTime > 3000 ? "Slow" : "Success";
    } catch (error) {
      status = "Fail";
    }

    await prisma.websiteStatusHistory.create({
      data: { site_id: site.id, status },
    });

    await prisma.website.update({
      where: { id: site.id },
      data: { last_check_time: new Date() },
    });
  }
};
