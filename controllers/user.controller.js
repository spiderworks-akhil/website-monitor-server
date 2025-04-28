import prisma from "../config/db.js";
import bcrypt from "bcrypt";

export const createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res
        .status(400)
        .json({ error: "Name, email, and role are required" });
    }

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const generatedPassword = `${name
      .toLowerCase()
      .replace(/\s+/g, "")}${randomDigits}`;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(generatedPassword, salt);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
      },
    });

    return res.status(201).json({ success: true, user });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
