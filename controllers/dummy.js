import prisma from "../config/db.js";

export const createDummy = async (req, res) => {
  try {
    const { name } = req.body;

    const newDummy = await prisma.dummy.create({
      data: { name },
    });

    return res.status(201).json(newDummy);
  } catch (error) {
    console.error("Error creating dummy:", error);
    return res.status(500).json({ error: "Failed to create dummy" });
  }
};

// Get all dummy entries
export const getAllDummies = async (req, res) => {
  try {
    const dummies = await prisma.dummy.findMany({
      orderBy: { id: "desc" },
    });

    return res.status(200).json(dummies);
  } catch (error) {
    console.error("Error fetching dummies:", error);
    return res.status(500).json({ error: "Failed to fetch dummies" });
  }
};