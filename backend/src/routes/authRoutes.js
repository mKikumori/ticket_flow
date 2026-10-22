import express from "express";
import {
  registerUser,
  registerAnalyst,
  loginUser,
  /*loginAnalyst,*/
  logout,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/register_analyst", registerAnalyst);
router.post("/login", loginUser);
//router.post("/login_analyst", loginAnalyst);
router.post("/logout", logout);

export default router;
