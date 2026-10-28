import express from "express";
import {
  registerUser,
  registerAnalyst,
  loginUser,
  logout,
  registerManager,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/register_analyst", registerAnalyst);
router.post("/register_manager", registerManager);
router.post("/login", loginUser);
router.post("/logout", logout);

export default router;
