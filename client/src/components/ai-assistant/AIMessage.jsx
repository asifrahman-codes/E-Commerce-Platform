import { Sparkles, User } from "lucide-react";

import AIProductCard from "./AIProductCard";

export default function AIMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2 ${
      isUser ? "justify-end" : "justify-start"
    }`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
          <Sparkles size={16} />
        </div>
      )}

      <div className={`max-w-[85%] space-y-3 ${
        isUser ? "items-end" : "items-start"
      }`}>
        <div className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${
          isUser
            ? "rounded-tr-sm bg-indigo-700 text-white"
            : "rounded-tl-sm bg-gray-100 text-gray-800"
        }`}>
          {message.content}
        </div>

        {message.products?.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {message.products.map((product) => (
              <AIProductCard
                key={product.product_id}
                product={product}
              />
            ))}
          </div>
        )}

        {message.comparison &&
          (!Array.isArray(message.comparison) ||
            message.comparison.length > 0) && (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs text-gray-700">
            <p className="mb-1 font-semibold text-indigo-800">
              Product comparison
            </p>

            {typeof message.comparison === "string"
              ? message.comparison
              : JSON.stringify(message.comparison, null, 2)}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600">
          <User size={16} />
        </div>
      )}
    </div>
  );
}