import HttpError from "../model/errorModel.js";
import Ticket from "../model/ticketModel.js";

export async function createTicket(req, res, next) {
  try {
    console.log("Authenticated user:", req.user);

    const { title, problem_type, description, criticality, status } = req.body;

    if (!title || !problem_type || !description) {
      return next(new HttpError("Fill in all mandatory fields", 422));
    }

    const newTicket = new Ticket({
      title,
      problem_type,
      description,
      criticality,
      status,
      user_id: req.user.id,
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
