import { GoogleGenAI } from "@google/genai";

import aiConfig from "../config/ai.config.js";

let geminiClient = null;

function getGeminiClient() {
  if (!aiConfig.enabled) {
    throw new Error("AI_FEATURE_DISABLED");
  }

  if (aiConfig.provider !== "gemini") {
    throw new Error("AI_PROVIDER_NOT_SUPPORTED");
  }

  if (!aiConfig.apiKey || !aiConfig.model) {
    throw new Error("AI_CONFIGURATION_MISSING");
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: aiConfig.apiKey,
    });
  }

  return geminiClient;
}

export async function generateGeminiText({
  prompt,
  systemInstruction,
  temperature = 0.4,
}) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("AI_PROMPT_REQUIRED");
  }

  try {
    const client = getGeminiClient();

    const response = await client.interactions.create({
      model: aiConfig.model,
      input: `${systemInstruction || ""}\n\n${prompt}`,
    });

    const text = response.output_text?.trim();

    if (!text) {
      throw new Error("AI_EMPTY_RESPONSE");
    }

    return text;
  } catch (error) {
  // TEMPORARY DEBUGGING: reveal the actual Gemini error
  console.error("Original Gemini API Error:", error);

  if ([
    "AI_FEATURE_DISABLED",
    "AI_PROVIDER_NOT_SUPPORTED",
    "AI_CONFIGURATION_MISSING",
    "AI_EMPTY_RESPONSE",
  ].includes(error.message)) {
    throw error;
  }

  throw new Error("AI_PROVIDER_REQUEST_FAILED");
}
}