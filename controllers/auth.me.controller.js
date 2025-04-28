import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

const getUserFromToken = (req) => {
  const token = req.cookies.token;
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

export const getMe = async (req, res) => {
  const decoded = getUserFromToken(req);
  if (!decoded) {
    return res.status(401).json({ user: null });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ user: null });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ user: null });
  }
};

export const updateMe = async (req, res) => {
  const decoded = getUserFromToken(req);
  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { email, name, password } = req.body;

  const updateData = {};
  if (email) updateData.email = email;
  if (name) updateData.name = name;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(password, salt);
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(400).json({
      error: error.message || "Failed to update user",
    });
  }
};
