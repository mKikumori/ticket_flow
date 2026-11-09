import express from "express";
import {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicketById,
} from "../controllers/ticketController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/createTicket", authMiddleware, createTicket);
router.get("/tickets", getAllTickets);
router.get("/:id", getTicketById);
router.put("/updateTicketById/:id", updateTicketById);

export default router;
