const express = require("express");

const authRoutes = require("./routes/authRoutes.js");
const { notFound, errorHandler } = require("./middleware/errorMiddleware.js");

const app = express();
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json("Hello");
});

app.listen(5001, () => {
  console.log("Server initiated on PORT: 5001");
});

app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);
