import express from "express";
import {
  registerUser,
  registerAnalyst,
  loginUser,
  logout,
  registerManager,
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
router.post("/logout", logout);

export default router;
