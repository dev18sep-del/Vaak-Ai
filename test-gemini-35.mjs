import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

async function run() {
  try {
    const ai = new GoogleGenAI({});
    
    // Simulate what server.ts does
    const formattedContents = [
      { role: "user", parts: [{text: "Hello"}] },
      { role: "model", parts: [{text: "Hi there!"}] },
      { role: "user", parts: [{text: "What is your name?"}] }
    ];

    const apiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: "You are a helpful assistant",
          temperature: 0.7,
        }
    });
    console.log(apiResponse.text);
  } catch(e) {
    console.error("Gemini Error:", e.message);
  }
}
run();
