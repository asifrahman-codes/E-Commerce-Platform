
import aiConfig from "../config/ai.config.js";
import { generateOpenRouterText } from "../providers/openrouter.provider.js";

export function getAIStatus() {
  return {
    enabled: aiConfig.enabled,
    provider: aiConfig.enabled ? aiConfig.provider : null,
    status: aiConfig.enabled ? "available" : "disabled",
  };
}

export async function generateAIResponse({
  prompt,
  systemInstruction,
  temperature = 0.4,
}) {
  if (!aiConfig.enabled) {
    throw new Error("AI_FEATURE_DISABLED");
  }

  if (aiConfig.provider !== "openrouter") {
    throw new Error("AI_PROVIDER_NOT_SUPPORTED");
  }

  return generateOpenRouterText({
    prompt,
    systemInstruction,
    temperature,
  });
}
