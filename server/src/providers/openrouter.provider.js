
import aiConfig from "../config/ai.config.js";

export async function generateOpenRouterText({
  prompt,
  systemInstruction,
  temperature = 0.4,
}) {
  if (!aiConfig.enabled) {
    throw new Error("AI_FEATURE_DISABLED");
  }

  if (!aiConfig.apiKey || !aiConfig.model) {
    throw new Error("AI_CONFIGURATION_MISSING");
  }

  if (!prompt || typeof prompt !== "string") {
    throw new Error("AI_PROMPT_REQUIRED");
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${aiConfig.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: [
            ...(systemInstruction
              ? [{ role: "system", content: systemInstruction }]
              : []),
            { role: "user", content: prompt },
          ],
          temperature,
        }),
        signal: AbortSignal.timeout(30000),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("OpenRouter API error:", result);
      throw new Error("AI_PROVIDER_REQUEST_FAILED");
    }

    const text = result.choices?.[0]?.message?.content?.trim();

    if (!text || typeof text !== "string") {
      throw new Error("AI_EMPTY_RESPONSE");
    }

    return text;
  } catch (error) {
    if (
      [
        "AI_FEATURE_DISABLED",
        "AI_CONFIGURATION_MISSING",
        "AI_PROMPT_REQUIRED",
        "AI_PROVIDER_REQUEST_FAILED",
        "AI_EMPTY_RESPONSE",
      ].includes(error.message)
    ) {
      throw error;
    }
    
    throw new Error("AI_PROVIDER_REQUEST_FAILED");
  }
}
