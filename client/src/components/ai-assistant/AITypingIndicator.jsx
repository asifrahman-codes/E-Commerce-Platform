import { Sparkles } from "lucide-react";

export default function AITypingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
        <Sparkles size={17} />
      </div>

      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:300ms]" />
      </div>
    </div>
  );
}