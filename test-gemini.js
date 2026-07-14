require('dotenv').config({ path: '.env.example' });
const { GoogleGenAI } = require("@google/genai");

async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: "Hello",
        config: { systemInstruction: "You are a helpful assistant" }
    });
    console.log(response.text);
  } catch(e) {
    console.error("Gemini Error:", e);
  }
}
run();
