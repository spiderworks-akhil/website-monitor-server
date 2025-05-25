import express from "express";
import { getMe, updateMe } from "../controllers/auth.me.controller.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/get-me", authenticateUser, getMe);
router.put("/update-me", authenticateUser, updateMe);

export default router;
