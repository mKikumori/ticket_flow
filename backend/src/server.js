import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { loadTicketCache } from "./cache/ticketCache.js";

import authRoutes from "./routes/authRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();
console.log(process.env.CORS_ORIGIN_URL);

app.get("/test", (req, res) => {
  console.log("TEST REQUEST WORKING");

  res.status(200).json({
    message: "Backend is working!",
  });
});

// Middleware
const allowedOrigins = [
  process.env.CORS_ORIGIN_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  console.log("ORIGIN:", req.headers.origin);
  next();
});

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error(`CORS blocked origin: ${origin}`);
    return callback(new Error("Origem não permitida."));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/ticket", ticketRoutes);
app.use("/api/user", userRoutes);

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();

    await connectRedis();

    await loadTicketCache();

    const PORT = process.env.PORT || 5001;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server initiated on PORT: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
