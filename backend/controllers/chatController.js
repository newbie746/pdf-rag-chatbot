const { embedText } = require("../services/embeddingService");
const { queryChunks } = require("../services/vectorStore");
const { generateAnswer } = require("../services/geminiService");

const TOP_K = 5;

/**
 * POST /chat
 * Body: { question: string, docId?: string }
 * Flow: embed question -> search Chroma -> top 5 chunks -> prompt -> Gemini -> answer
 */
async function chat(req, res) {
  try {
    const { question, docId, history = [] } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: "Question is required" });
    }

    const queryEmbedding = await embedText(question);

    const retrievedChunks = await queryChunks({
      queryEmbedding,
      topK: TOP_K,
      docId: docId || null,
    });

    // Even if retrievedChunks is empty, we still pass it to generateAnswer 
    // so the LLM can handle conversational greetings gracefully.

    const { answer, sources } = await generateAnswer(retrievedChunks, question, history);

    res.json({ success: true, answer, sources });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to generate answer" });
  }
}

module.exports = { chat };
