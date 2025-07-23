import express from "express";
import {
  signup,
  signin,
  logout,
  changePassword,
  createUser,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/logout", logout);
router.post("/change-password/:id", changePassword);
router.post("/create-user", createUser);

export default router;
