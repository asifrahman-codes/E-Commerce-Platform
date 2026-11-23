
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
    let response;
    let result;
    const requestBody = JSON.stringify({
      model: aiConfig.model,
      messages: [
        ...(systemInstruction
          ? [{ role: "system", content: systemInstruction }]
          : []),
        { role: "user", content: prompt },
      ],
      temperature,
      max_tokens: 1000,
    });

    for (let attempt = 0; attempt < 2; attempt++) {
      response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${aiConfig.apiKey}`,
            "Content-Type": "application/json",
          },
          body: requestBody,
          signal: AbortSignal.timeout(30000),
        }
      );

      result = await response.json();

      if (response.ok) break;

      if (attempt === 0 && (response.status === 429 || response.status >= 500)) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        continue;
      }

      console.error("OpenRouter API error", {
        status: response.status,
      });
      throw new Error("AI_PROVIDER_REQUEST_FAILED");
    }

    if (!response?.ok) {
      throw new Error("AI_PROVIDER_REQUEST_FAILED");
    }

    const choice = result.choices?.[0];
    const rawContent = choice?.message?.content;
    const contentText = Array.isArray(rawContent)
      ? rawContent
          .map((part) => typeof part === "string"
            ? part
            : part?.text || part?.content || "")
          .join("\n")
          .trim()
      : typeof rawContent === "string"
        ? rawContent.trim()
        : "";
    const text =
      contentText ||
      choice?.message?.reasoning_content?.trim() ||
      choice?.text?.trim();

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
