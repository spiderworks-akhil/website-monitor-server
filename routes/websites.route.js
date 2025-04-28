import express from "express";
import {
  getWebsites,
  createWebsite,
  checkWebsites,
  getWebsiteDetails,
  deleteWebsiteStatusHistory,
} from "../controllers/websites.controller.js";

const router = express.Router();

router.get("/get-websites", getWebsites);
router.post("/add-website", createWebsite);
router.get("/check-websites", checkWebsites);
router.get("/website-details/:id", getWebsiteDetails);
router.delete(
  "/website-details/:id/status-history",
  deleteWebsiteStatusHistory
);

export default router;
