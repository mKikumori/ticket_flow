import express from "express";
import {
  createTicket,
  openTicketChat,
  listChats,
  getAllTickets,
  getTicketById,
  updateTicketById,
} from "../controllers/ticketController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/createTicket", authMiddleware, createTicket);
router.post("/:id/chat", authMiddleware, openTicketChat);
router.get("/tickets", getAllTickets);
router.get("/chats", authMiddleware, listChats);
router.get("/:id", getTicketById);
router.put("/updateTicketById/:id", updateTicketById);

export default router;
