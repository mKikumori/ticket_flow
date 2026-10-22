import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
/*
const { notFound, errorHandler } = require("./middleware/errorMiddleware.js");
*/
dotenv.config();
const app = express();
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use(
  cors({
    origin: `${process.env.CORS_ORIGIN_URL}`,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ticket", ticketRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server initiated on PORT: ${process.env.PORT}`);
});
/*

app.use(notFound);
app.use(errorHandler);
*/
