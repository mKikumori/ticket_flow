import express from "express";
import { createTicket } from "../controllers/ticketController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/createTicket", authMiddleware, createTicket);

export default router;
