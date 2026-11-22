
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

try {
  const result = await ai.interactions.create({
    model: "gemini-3.8-flash",
    input: "Reply with exactly: ShopSphere AI is working.",
  });

  console.log("SUCCESS:", result.output_text);
} catch (error) {
  console.error("DIRECT TEST ERROR:", error);
}
