import { useState } from "react";
import { Bot, MessageCircle, X } from "lucide-react";

import AIChatWindow from "./AIChatWindow";

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <AIChatWindow
          onClose={() => setIsOpen(false)}
        />
      )}

      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={
          isOpen
            ? "Close AI assistant"
            : "Open AI assistant"
        }
        aria-expanded={isOpen}
        className="fixed bottom-5 right-5 z-[110] flex h-14 w-14 items-center justify-center rounded-full bg-indigo-700 text-white shadow-xl transition hover:scale-105 hover:bg-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-300"
      >
        {isOpen ? (
          <X size={25} />
        ) : (
          <MessageCircle size={25} />
        )}
      </button>
    </>
  );
}