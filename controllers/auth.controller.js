import prisma from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { name, email, password, playerId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
      user_type: "BASIC",
    };

    if (playerId) {
      userData.playerId = playerId;
    }

    const newUser = await prisma.user.create({
      data: userData,
    });

    await prisma.cronFrequency.create({
      data: {
        userId: newUser.id,
        frequency: 5,
      },
    });

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password, playerId } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (playerId && (!user.playerId || user.playerId !== playerId)) {
      const existingPlayerId = await prisma.user.findFirst({
        where: {
          playerId,
          id: { not: user.id },
        },
      });

      if (!existingPlayerId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { playerId },
        });
      }
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: "Signed in successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Signin Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!id || !password) {
      return res
        .status(400)
        .json({ message: "User ID and new password are required" });
    }

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createUser = async (req, res) => {
  try {
    let { id, name, email, phone, playerId } = req.body;

    if (!id || !name || !email) {
      return res
        .status(400)
        .json({ message: "ID, name, and email are required" });
    }

    id = parseInt(id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID must be a valid integer" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (existingUser) {
      if (
        playerId &&
        (!existingUser.playerId || existingUser.playerId !== playerId)
      ) {
        const existingPlayerId = await prisma.user.findFirst({
          where: {
            playerId,
            id: { not: existingUser.id },
          },
        });

        if (!existingPlayerId) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { playerId },
          });
        }
      }

      return res.status(200).json({
        success: true,
      });
    }

    const userData = {
      id,
      name,
      email,
    };

    if (phone) {
      userData.phone = phone;
    }

    if (playerId) {
      userData.playerId = playerId;
    }

    const newUser = await prisma.user.create({
      data: userData,
    });

    await prisma.cronFrequency.create({
      data: {
        userId: newUser.id,
        frequency: 5,
      },
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Create User Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        user_type: true,
        playerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get Current User Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
