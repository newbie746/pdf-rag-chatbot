const fs = require("fs");
const pdfParse = require("pdf-parse");

/**
 * Extracts text content from a PDF file on disk.
 * Also returns per-page text so we can support page-level source citations.
 */
async function parsePDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);

  const pageTexts = [];

  // pdf-parse lets us hook into each rendered page via pagerender
  const options = {
    pagerender: async (pageData) => {
      const textContent = await pageData.getTextContent();
      const text = textContent.items.map((item) => item.str).join(" ");
      pageTexts.push(text);
      return text;
    },
  };

  const result = await pdfParse(dataBuffer, options);

  return {
    fullText: result.text,
    numPages: result.numpages,
    pageTexts, // array of text per page, index 0 = page 1
    info: result.info || {},
  };
}

module.exports = { parsePDF };
