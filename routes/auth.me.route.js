import express from "express";
import { getMe, updateMe } from "../controllers/auth.me.controller.js";

const router = express.Router();

router.get("/get-me", getMe);
router.put("/update-me", updateMe);

export default router;
