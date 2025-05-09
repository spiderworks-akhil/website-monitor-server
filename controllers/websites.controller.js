import prisma from "../config/db.js";
import axios from "axios";
import https from "https";
import { sendWebsiteFailureAlert } from "../index.js";

const agent = new https.Agent({ rejectUnauthorized: false });

export const getWebsites = async (req, res) => {
  try {
    const { name, startDate, endDate, includeToday } = req.query;

    let where = {};
    if (name) {
      where.site_name = { contains: name, mode: "insensitive" };
    }

    const statusHistoryWhere = [];

    if (includeToday === "true") {
      const today = new Date();
      const todayStart = new Date(today);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);
      statusHistoryWhere.push({
        check_time: { gte: todayStart, lte: todayEnd },
      });
    }

    if (startDate || endDate) {
      const rangeCondition = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        rangeCondition.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        rangeCondition.lte = end;
      }
      statusHistoryWhere.push({ check_time: rangeCondition });
    }

    const websites = await prisma.website.findMany({
      where,
      include: {
        statusHistory: {
          orderBy: { check_time: "desc" },
          where:
            statusHistoryWhere.length > 0
              ? { OR: statusHistoryWhere }
              : undefined,
        },
      },
    });

    return res.status(200).json(websites);
  } catch (error) {
    console.error("Error fetching websites:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching websites." });
  }
};

export const createWebsite = async (req, res) => {
  try {
    const { site_name, url } = req.body;

    if (!site_name || !url) {
      return res.status(400).json({ error: "Site name and URL are required." });
    }

    const website = await prisma.website.create({
      data: { site_name, url },
    });

    return res.status(201).json(website);
  } catch (error) {
    console.error("Error creating website:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating the website." });
  }
};

export const checkWebsites = async (req, res) => {
  try {
    const websites = await prisma.website.findMany();

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
        sendWebsiteFailureAlert({
          siteName: site.name,
          siteUrl: site.url,
          failedAt: new Date().toISOString(),
        });
      }
    }

    return res.status(200).json({ message: "Manual website check completed." });
  } catch (error) {
    console.error("Error checking websites:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while checking websites." });
  }
};

export const getWebsiteDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const range = req.query.range || "24h";

    if (!id) {
      return res.status(400).json({ error: "Website ID is required." });
    }

    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setHours(now.getHours() - 24);
    }

    const website = await prisma.website.findUnique({
      where: { id: parseInt(id) },
      include: {
        statusHistory: {
          where: {
            check_time: {
              gte: startDate,
              lte: now,
            },
          },
          orderBy: { check_time: "desc" },
          take: 100,
        },
      },
    });

    if (!website) {
      return res.status(404).json({ error: "Website not found." });
    }

    const totalChecks = website.statusHistory.length;
    const successChecks = website.statusHistory.filter(
      (check) => check.status === "Success"
    ).length;
    const slowChecks = website.statusHistory.filter(
      (check) => check.status === "Slow"
    ).length;
    const failedChecks = totalChecks - successChecks - slowChecks;

    return res.json({
      ...website,
      uptimePercentage:
        totalChecks > 0 ? Math.round((successChecks / totalChecks) * 100) : 0,
      slowResponses: slowChecks,
      downtimeCount: failedChecks,
    });
  } catch (error) {
    console.error("Error fetching website details:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching website details." });
  }
};

export const deleteWebsiteStatusHistory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Website ID is required." });
    }

    const website = await prisma.website.findUnique({
      where: { id: parseInt(id) },
    });

    if (!website) {
      return res.status(404).json({ error: "Website not found." });
    }

    await prisma.websiteStatusHistory.deleteMany({
      where: { site_id: parseInt(id) },
    });

    return res
      .status(200)
      .json({ message: "Status history deleted successfully." });
  } catch (error) {
    console.error("Error deleting status history:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting status history." });
  }
};
