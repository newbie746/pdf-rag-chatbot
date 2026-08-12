require("dotenv").config();

const express = require("express");
const cors = require("cors");

const uploadRoute = require("./routes/uploadRoute");
const chatRoute = require("./routes/chatRoute");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "PDF RAG Chatbot API is running",
  });
});

app.use("/", uploadRoute);
app.use("/", chatRoute);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(400).json({
    success: false,
    message: err.message || "Something went wrong",
  });
});

module.exports = app;