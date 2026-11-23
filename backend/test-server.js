import express from "express";

const app = express();

app.get("/test", (req, res) => {
  console.log("TEST REQUEST RECEIVED");

  return res.status(200).json({
    message: "HTTP connection working!",
  });
});

app.use((req, res) => {
  return res.status(404).json({
    message: "Route not found",
  });
});

app.listen(5050, "0.0.0.0", () => {
  console.log("Test server running on port 5050");
});
