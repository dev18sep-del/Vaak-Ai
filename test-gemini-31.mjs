import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

async function run() {
  try {
    const ai = new GoogleGenAI({});
    
    // Simulate what server.ts does
    const formattedContents = [
      { role: "user", parts: [{text: "Hello"}] }
    ];

    const apiResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: formattedContents
    });
    console.log(apiResponse.text);
  } catch(e) {
    console.error("Gemini Error:", e.message);
  }
}
run();
