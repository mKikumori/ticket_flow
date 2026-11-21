import express from "express";
import {
  registerUser,
  registerAnalyst,
  loginUser,
  logout,
  registerManager,
  forgotPsw,
  verifyOtp,
  resetPsw,
} from "../controllers/authController.js";
import {
  authMiddleware,
  authorizeRoles,
  validateRegisterUser,
  validateRegisterManager,
  validateRegisterAnalyst,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", validateRegisterUser, registerUser);

router.post(
  "/register_analyst",
  authMiddleware,
  authorizeRoles("manager"),
  validateRegisterAnalyst,
  registerAnalyst,
);

router.post("/register_manager", validateRegisterManager, registerManager);
router.post("/login", loginUser);
router.post("/reset_password", resetPsw);
router.post("/verify_otp", verifyOtp);
router.post("/forgot_password", forgotPsw);
router.post("/logout", logout);

export default router;
