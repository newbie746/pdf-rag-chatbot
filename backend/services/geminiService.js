const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const CHAT_MODEL = "gemini-3.5-flash-lite";

const SYSTEM_INSTRUCTION = `You are a helpful and intelligent AI assistant.
Your primary task is to answer questions based on the provided document context.

If the user is simply greeting you (e.g., "hi", "hello") or making small talk, respond naturally and politely, and offer to help them with their uploaded document.

If they ask a question about the document, answer it ONLY using the context provided in the latest message.
If the answer to their document-related question is not available in the context, reply: "I couldn't find this information in the uploaded document."`;

/**
 * Sends retrieved context + the user's question to Gemini
 * and returns the generated answer text.
 */
async function generateAnswer(retrievedChunks, question, history = []) {
  const context = retrievedChunks
    .map((c, i) => `[${i + 1}] (Page ${c.metadata?.page ?? "?"}) ${c.text}`)
    .join("\n\n");

  const model = genAI.getGenerativeModel({ 
    model: CHAT_MODEL,
    systemInstruction: SYSTEM_INSTRUCTION
  });
  
  // Convert frontend history ({role: "user" | "ai", text}) to Gemini format
  const formattedHistory = history.map(msg => ({
    role: msg.role === "ai" ? "model" : "user",
    parts: [{ text: msg.text }]
  }));

  const chatSession = model.startChat({
    history: formattedHistory,
  });

  // For the final user message, we inject the retrieved context
  const userMessageWithContext = `Context from document:\n${context || "No context found."}\n\nUser Question:\n${question}`;

  const result = await chatSession.sendMessage(userMessageWithContext);
  const answer = result.response.text();

  // Collect unique page numbers used, for source citation
  const sources = [
    ...new Set(
      retrievedChunks
        .map((c) => c.metadata?.page)
        .filter((p) => p !== undefined && p !== null)
    ),
  ].sort((a, b) => a - b);

  return { answer, sources };
}

module.exports = { generateAnswer };
