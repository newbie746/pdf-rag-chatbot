const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const { parsePDF } = require("../services/pdfParser");
const { chunkText } = require("../utils/chunkText");
const { embedChunks } = require("../services/embeddingService");
const { addChunks, deleteDocument, listDocuments } = require("../services/vectorStore");

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 100;

/**
 * POST /upload
 * Accepts a PDF, extracts text, chunks it (per page, 500 words / 100 overlap),
 * generates embeddings, and stores everything in ChromaDB.
 */
async function uploadPDF(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No PDF file uploaded" });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const docId = uuidv4();

    const { pageTexts, numPages } = await parsePDF(filePath);

    // Chunk per page so each chunk can be tagged with a page number
    // (satisfies the 500-word / 100-word-overlap chunking strategy).
    const allChunks = [];
    pageTexts.forEach((pageText, pageIndex) => {
      const pageChunks = chunkText(pageText, CHUNK_SIZE, CHUNK_OVERLAP);
      pageChunks.forEach((c) => {
        allChunks.push({ text: c.text, page: pageIndex + 1 });
      });
    });

    if (allChunks.length === 0) {
      return res.status(400).json({ success: false, message: "Could not extract any text from this PDF" });
    }

    const embeddings = await embedChunks(allChunks);

    const ids = allChunks.map((_, i) => `${docId}-${i}`);
    const documents = allChunks.map((c) => c.text);
    const metadatas = allChunks.map((c) => ({
      docId,
      fileName,
      page: c.page,
      uploadedAt: new Date().toISOString(),
    }));

    await addChunks({ ids, embeddings, documents, metadatas });

    res.json({
      success: true,
      docId,
      fileName,
      numPages,
      numChunks: allChunks.length,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to process PDF" });
  }
}

/**
 * GET /documents
 * Lists uploaded documents.
 */
async function getDocuments(req, res) {
  try {
    const docs = await listDocuments();
    res.json({ success: true, documents: docs });
  } catch (err) {
    console.error("List documents error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * DELETE /documents/:docId
 * Removes a document's chunks from the vector store and deletes its file.
 */
async function removeDocument(req, res) {
  try {
    const { docId } = req.params;
    await deleteDocument(docId);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete document error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { uploadPDF, getDocuments, removeDocument };
