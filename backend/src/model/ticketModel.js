import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    has_chat: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: true,
    },
    problem_type: {
      type: String,
      enum: [
        "Problema 1",
        "Problema 2",
        "Problema 3",
        "Problema 4",
        "Problema 5",
        "Problema 6",
        "Problema 7",
        "Problema 8",
      ],
      message: "{VALUE} is not supported",
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      required: true,
    },
    pc_brand: {
      type: String,
      default: null,
    },
    has_monitor: {
      type: Boolean,
      default: false,
    },
    criticality: {
      type: String,
      enum: ["Low", "Medium", "High"],
      message: "{VALUE} is not supported",
      required: true,
      default: "Low",
    },
    status: {
      type: String,
      enum: ["Open", "Closed", "In Progress"],
      message: "{VALUE} is not supported",
      required: true,
      default: "Open",
    },
    comments: [
      {
        analyst_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Analyst",
          required: true,
        },
        /*manager_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Manager",
          default: null,
        },*/
        conteudo: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    log_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Log",
      default: null,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    analyst_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Analyst",
      default: null,
    },
    chat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
