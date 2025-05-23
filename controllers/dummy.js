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
    return res.status(500).json({ error: "Failed to create dummy",message:error.message });
  }
};

// Get all dummy entries
export const getAllDummies = async (req, res) => {
  try {
    console.log('First Log');

    const dummies = await prisma.dummy.findMany({
      orderBy: { id: "desc" },
    });

    console.log('Second Log');
    
    return res.status(200).json(dummies);
  } catch (error) {
    console.error("Error fetching dummies:", );
    return res.status(500).json({ error: error?.message });
  }
};