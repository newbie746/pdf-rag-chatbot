const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log("Fetching all models...");
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("All Models:", data.models.map(m => m.name));
  } catch(e) {
    console.error(e);
  }
}
run();
