const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const EMBEDDING_MODEL = "gemini-embedding-2"; // Google embedding model

/**
 * Generates an embedding vector for a single piece of text.
 */
async function embedText(text) {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

/**
 * Generates embeddings for an array of text chunks.
 * Runs sequentially in small batches to avoid rate limits.
 */
async function embedChunks(chunks, batchSize = 10) {
  const embeddings = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const batchEmbeddings = await Promise.all(
      batch.map((chunk) => embedText(chunk.text))
    );
    embeddings.push(...batchEmbeddings);
  }

  return embeddings;
}

module.exports = { embedText, embedChunks };
