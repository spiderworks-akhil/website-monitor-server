import express from "express";
import {
  getWebsites,
  createWebsite,
  checkWebsites,
  getWebsiteDetails,
  deleteWebsiteStatusHistory,
  deleteWebsite,
} from "../controllers/websites.controller.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/get-websites", authenticateUser, getWebsites);
router.post("/add-website", authenticateUser, createWebsite);
router.get("/check-websites", checkWebsites);
router.get("/website-details/:id", getWebsiteDetails);
router.delete(
  "/website-details/:id/status-history",
  deleteWebsiteStatusHistory
);
router.delete("/website-delete/:id", deleteWebsite);

export default router;
