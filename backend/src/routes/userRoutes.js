import express from "express";
import {
  getUser,
  updateUser,
  updatePfp,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getUser);
router.put("/", authMiddleware, updateUser);
router.patch("/profile-picture", authMiddleware, updatePfp);

export default router;
