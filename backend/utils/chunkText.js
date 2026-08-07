/**
 * Splits raw text into overlapping word-based chunks.
 * Default: 500 words per chunk, 100 words overlap.
 */
function chunkText(text, chunkSize = 500, overlap = 100) {
  if (!text || typeof text !== "string") return [];

  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];

  if (words.length === 0) return chunks;

  let start = 0;
  let index = 0;

  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    const chunkWords = words.slice(start, end);
    chunks.push({
      id: `chunk-${index}`,
      text: chunkWords.join(" "),
      wordStart: start,
      wordEnd: end,
    });

    index += 1;

    if (end === words.length) break;
    start = end - overlap; // move forward but overlap previous chunk
    if (start < 0) start = 0;
  }

  return chunks;
}

module.exports = { chunkText };
