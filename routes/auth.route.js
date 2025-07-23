import express from "express";
import {
  changePassword,
  createUser,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/change-password/:id", changePassword);
router.post("/create-user", createUser);
router.get("/current-user", authenticateUser, getCurrentUser);

export default router;
