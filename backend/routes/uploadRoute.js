const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { uploadPDF, getDocuments, removeDocument } = require("../controllers/uploadController");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files are allowed"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 25 * 1024 * 1024 } });

router.post("/upload", upload.single("pdf"), uploadPDF);
router.get("/documents", getDocuments);
router.delete("/documents/:docId", removeDocument);

module.exports = router;
