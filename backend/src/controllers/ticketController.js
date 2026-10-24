import HttpError from "../model/errorModel.js";
import Ticket from "../model/ticketModel.js";

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
