import HttpError from "../model/errorModel.js";
import Ticket from "../model/ticketModel.js";
import Chat from "../model/chatModel.js";
import Message from "../model/messageModel.js";
import mongoose from "mongoose";
import { cacheTickets, getCachedTicket, setCachedTicket } from "../cache/ticketCache.js";

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

export async function openTicketChat(req, res, next) {
  try {
    const { id } = req.params;
    const text = typeof req.body.message === "string" ? req.body.message.trim() : "";

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new HttpError("Ticket ID inválido", 400));
    }

    if (!text) {
      return next(new HttpError("Escreva a primeira mensagem.", 422));
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return next(new HttpError("Ticket não encontrado", 404));
    }

    if (ticket.chat_id) {
      return next(new HttpError("Este ticket já tem um chat.", 409));
    }

    const chatId = new mongoose.Types.ObjectId();
    const message = await Message.create({
      message: text,
      sender: req.user.id,
      chat_id: chatId,
    });

    const chat = await Chat.create({
      _id: chatId,
      members: [req.user.id],
      ticket_id: ticket._id,
      messages_id: message._id,
    });

    ticket.has_chat = true;
    ticket.chat_id = chat._id;
    await ticket.save();

    return res.status(201).json({
      message: "Chat aberto.",
      chat_id: chat._id,
    });
  } catch (error) {
    return next(error);
  }
}

export async function listChats(req, res, next) {
  try {
    const chats = await Chat.find().sort({ updatedAt: -1 }).lean();
    const tickets = await Ticket.find({
      _id: { $in: chats.map((chat) => chat.ticket_id) },
    }).lean();
    const messages = await Message.find({
      chat_id: { $in: chats.map((chat) => chat._id) },
    })
      .sort({ createdAt: -1 })
      .lean();

    const ticketById = new Map(tickets.map((ticket) => [String(ticket._id), ticket]));
    const messageByChat = new Map();
    messages.forEach((item) => {
      const key = String(item.chat_id);
      if (!messageByChat.has(key)) messageByChat.set(key, item.message);
    });

    const statusMap = {
      Open: "Aberto",
      "In Progress": "Em progresso",
      Closed: "Fechado",
    };

    return res.status(200).json(
      chats.map((chat) => {
        const ticket = ticketById.get(String(chat.ticket_id));
        return {
          id: chat._id,
          ticketId: ticket?._id || null,
          code: ticket ? String(ticket._id).slice(-6).toUpperCase() : "—",
          title: ticket?.title || "Ticket",
          analyst: "Não atribuído",
          status: statusMap[ticket?.status] || ticket?.status || "—",
          updated: chat.updatedAt,
          message: messageByChat.get(String(chat._id)) || "",
        };
      }),
    );
  } catch (error) {
    return next(error);
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
