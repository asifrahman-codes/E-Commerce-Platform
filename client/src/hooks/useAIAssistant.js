import {
  useCallback,
  useState,
} from "react";

import aiAssistantService from "../services/ai-assistant.service";

const MAX_HISTORY_MESSAGES = 6;

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I'm your ShopSphere AI shopping assistant. I can help you discover products, compare options, and find the right products for your needs.",
  products: [],
};

function createMessage(role, content, extra = {}) {
  return {
    id: `${Date.now()}-${Math.random()}`,
    role,
    content,
    ...extra,
  };
}

export default function useAIAssistant() {
  const [messages, setMessages] = useState([
    WELCOME_MESSAGE,
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = useCallback(
    async (message, productIds = []) => {
      const trimmedMessage = message.trim();

      if (!trimmedMessage || loading) {
        return;
      }

      const userMessage = createMessage(
        "user",
        trimmedMessage
      );

      const conversationHistory = messages
        .filter((item) => item.id !== "welcome")
        .slice(-MAX_HISTORY_MESSAGES)
        .map((item) => ({
          role: item.role,
          content: item.content,
        }));

      setMessages((previous) => [
        ...previous,
        userMessage,
      ]);

      setLoading(true);
      setError("");

      try {
        const response =
          await aiAssistantService.sendMessage({
            message: trimmedMessage,
            history: conversationHistory,
            ...(productIds.length
              ? { productIds }
              : {}),
          });

        const result = response?.data ?? response;

        const assistantMessage = createMessage(
          "assistant",
          result?.reply ||
            "I couldn't generate a response. Please try again.",
          {
            intent: result?.intent || null,
            products: result?.products || [],
            comparison: Array.isArray(result?.comparison) &&
              result.comparison.length === 0
              ? null
              : result?.comparison || null,
            search: result?.search || null,
          }
        );

        setMessages((previous) => [
          ...previous,
          assistantMessage,
        ]);
      } catch (err) {
        const message =
          err.message ||
          "Unable to contact the AI assistant. Please try again.";

        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading]
  );

  const clearConversation = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setError("");
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearConversation,
  };
}