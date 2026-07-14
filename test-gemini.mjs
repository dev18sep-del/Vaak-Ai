import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

async function run() {
  try {
    const ai = new GoogleGenAI({});
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
