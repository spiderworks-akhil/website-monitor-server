import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import https from "https";

const agent = new https.Agent({ rejectUnauthorized: false });

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

export const initializeAllUserCronJobs = async () => {
  const frequencies = await prisma.cronFrequency.findMany();

  const latestFrequencies = new Map();
  for (const freq of frequencies) {
    if (
      !latestFrequencies.has(freq.userId) ||
      new Date(freq.updatedAt) >
        new Date(latestFrequencies.get(freq.userId).updatedAt)
    ) {
      latestFrequencies.set(freq.userId, freq);
    }
  }

  for (const freq of latestFrequencies.values()) {
    startUserCronJob(freq.userId, freq.frequency);
  }
};

export const updateUserCronFrequency = async (userId, frequency) => {
  if (![1, 5, 10, 15, 30].includes(frequency)) {
    throw new Error("Invalid frequency. Must be 1, 5, 10, 15, or 30 minutes.");
  }

  await prisma.cronFrequency.create({
    data: { userId, frequency },
  });

  startUserCronJob(userId, frequency);
};

export const getUserCronFrequency = async (userId) => {
  const freq = await prisma.cronFrequency.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

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

    if (status === "Fail") {
      await prisma.websiteFailureNotification.create({
        data: {
          siteName: site.site_name,
          siteUrl: site.url,
          userId: site.userId,
        },
      });
    }
  }
};
