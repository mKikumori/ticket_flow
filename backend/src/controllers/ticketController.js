import HttpError from "../model/errorModel.js";
import Ticket from "../model/ticketModel.js";
import mongoose from "mongoose";
import { getCachedTicket, setCachedTicket } from "../cache/ticketCache.js";

// POST to create new ticket
// api/ticket/createTicket
export async function createTicket(req, res, next) {
  try {
    console.log("Authenticated user:", req.user);

    const { title, problem_type, description } = req.body;

    if (!title || !problem_type || !description) {
      return next(new HttpError("Fill in all mandatory fields", 422));
    }

    const newTicket = new Ticket({
      title,
      problem_type,
      description,
      user_id: req.user.id, // id do usuario logado no browser (localStorage)
      log_id: null,
      analyst_id: null,
      chat_id: null,
    });

    await newTicket.save();

    res.status(201).json({
      message: `New ticket "${newTicket.title}" created!`,
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Ticket creation error:", error);
    return next(new HttpError("Ticket creation failed", 422));
  }
}

// GET to get all tickets
// api/ticket/getAllTickets
export async function getAllTickets(req, res, next) {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 }).lean();

    cacheTickets(tickets);

    return res.status(200).json(tickets);
  } catch (error) {
    console.log(error);
    return next(new HttpError(`Erro achando os tickets`, 500));
  }
}

// GET to get a ticket by ID (cached data)
// api/ticket/:id
export function getTicketById(req, res, next) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new HttpError("Ticket ID inválido", 400));
  }

  const ticket = getCachedTicket(id);

  if (!ticket) {
    return next(new HttpError("Ticket não encontrado", 400));
  }

  return res.status(200).json(ticket);
}

// PUT to update a ticket by ID (DB data + cached data)
// api/ticket/updateTicketById/:id
export async function updateTicketById(req, res, next) {
  try {
    const { id } = req.params;
    const ticket = getCachedTicket(id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new HttpError("Ticket ID inválido", 400));
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedTicket) {
      return next(new HttpError("Ticket não encontrado", 400));
    }

    setCachedTicket(updatedTicket);

    return res.status(200).json(updatedTicket);
  } catch (error) {
    console.log(error);
    return next(new HttpError(`Erro atualizando o ticket`, 500));
  }
}
