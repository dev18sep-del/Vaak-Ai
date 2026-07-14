import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

async function run() {
  try {
    const ai = new GoogleGenAI({});
    const models = await ai.models.list();
    const modelNames = [];
    for await (const m of models) {
       modelNames.push(m.name);
    }
    console.log(modelNames.filter(n => n.includes("flash")));
  } catch(e) {
    console.error("Gemini Error:", e);
  }
}
run();
