require("dotenv").config();
const express = require("express");
const cors = require("cors");

const uploadRoute = require("./routes/uploadRoute");
const chatRoute = require("./routes/chatRoute");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "PDF RAG Chatbot API is running" });
});

app.use("/", uploadRoute);
app.use("/", chatRoute);

// Centralized error handler (e.g. multer file-type errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ success: false, message: err.message || "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
