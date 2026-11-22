import {
  Bot,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import useAIAssistant from "../../hooks/useAIAssistant";
import AIMessage from "./AIMessage";
import AITypingIndicator from "./AITypingIndicator";

const SUGGESTIONS = [
  "Find products for me",
  "Show me popular products",
  "Help me compare products",
  "What should I buy?",
];

export default function AIChatWindow({ onClose }) {
  const [input, setInput] = useState("");

  const {
    messages,
    loading,
    error,
    sendMessage,
    clearConversation,
  } = useAIAssistant();

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!input.trim() || loading) return;

    const message = input;
    setInput("");

    await sendMessage(message);
  };

  return (
    <section
      role="dialog"
      aria-label="ShopSphere AI Assistant"
      className="fixed bottom-24 right-4 z-[100] flex h-[min(650px,calc(100dvh-120px))] w-[min(420px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:right-6"
    >
      {/* Header */}
      <header className="flex items-center justify-between bg-indigo-700 px-4 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
            <Sparkles size={21} />
          </div>

          <div>
            <h2 className="font-semibold">
              ShopSphere AI
            </h2>

            <p className="text-xs text-indigo-100">
              Your intelligent shopping assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearConversation}
            title="Clear conversation"
            aria-label="Clear conversation"
            className="rounded-lg p-2 transition hover:bg-white/15"
          >
            <RotateCcw size={17} />
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close assistant"
            className="rounded-lg p-2 transition hover:bg-white/15"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div
        className="flex-1 space-y-5 overflow-y-auto bg-white p-4"
        aria-live="polite"
      >
        {messages.map((message) => (
          <AIMessage
            key={message.id}
            message={message}
          />
        ))}

        {messages.length === 1 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Try asking
            </p>

            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={loading}
                onClick={() => sendMessage(suggestion)}
                className="block w-full rounded-xl border border-gray-200 px-3 py-2.5 text-left text-sm text-gray-700 transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {loading && <AITypingIndicator />}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
          >
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-100 bg-white p-3"
      >
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2 focus-within:border-indigo-400">
          <input
            ref={inputRef}
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            placeholder="Ask me anything..."
            maxLength={1000}
            disabled={loading}
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-700 text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={17} />
          </button>
        </div>

        <p className="mt-2 text-center text-[10px] text-gray-400">
          AI can make mistakes. Verify product details before purchasing.
        </p>
      </form>
    </section>
  );
}