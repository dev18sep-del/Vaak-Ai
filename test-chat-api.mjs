import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

async function run() {
  try {
    const ai = new GoogleGenAI({});
    
    // Exact format from server.ts
    const formattedContents = [
      {
        role: "user",
        parts: [{ text: "hi" }]
      }
    ];

    const systemInstruction = "You are a helpful assistant.";

    const apiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
    });
    console.log(apiResponse.text);
  } catch(e) {
    console.error("Gemini Error:", e);
  }
}
run();
