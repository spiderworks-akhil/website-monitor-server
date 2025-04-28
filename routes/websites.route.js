import express from "express";
import {
  getWebsites,
  createWebsite,
  checkWebsites,
  getWebsiteDetails,
} from "../controllers/websites.controller.js";

const router = express.Router();

router.get("/get-websites", getWebsites);
router.post("/add-website", createWebsite);
router.get("/check-websites", checkWebsites);
router.get("/website-details/:id", getWebsiteDetails);

export default router;
