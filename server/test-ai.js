import "./src/config/env.js";

const { generateAIResponse } = await import(
  "./src/services/ai.service.js"
);

try {
  const response = await generateAIResponse({
    systemInstruction:
      "You are an AI assistant integrated into ShopSphere, an e-commerce platform.",

    prompt: "Introduce yourself in one short sentence.",
  });

  console.log("OpenRouter response:", response);
} catch (error) {
  console.error("AI test failed:", error.message);
}