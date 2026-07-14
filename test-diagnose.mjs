import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

async function run() {
  try {
    const ai = new GoogleGenAI({});
    const prompt = "diagnose this";

    const apiResponse = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt
    });
    console.log(apiResponse.text);
  } catch(e) {
    console.error("Gemini Error:", e);
  }
}
run();
