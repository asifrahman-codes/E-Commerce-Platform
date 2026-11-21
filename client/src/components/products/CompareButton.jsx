import { useState } from "react";
import { ArrowLeftRight, Check, X } from "lucide-react";

import {
  MAX_COMPARISON_PRODUCTS,
  useProductComparison,
} from "../../context/ProductComparisonContext";

export default function CompareButton({
  productId,
  className = "",
  compact = false,
}) {
  const {
    addProduct,
    removeProduct,
    isCompared,
  } = useProductComparison();
  const [message, setMessage] = useState("");
  const added = isCompared(productId);

  const handleClick = () => {
    setMessage("");
    if (added) {
      removeProduct(productId);
      setMessage("Removed from comparison.");
      return;
    }

    const result = addProduct(productId);
    if (result.success) return;
    if (result.reason === "limit") {
      setMessage(
        `You can compare up to ${MAX_COMPARISON_PRODUCTS} products.`
      );
    } else if (result.reason === "duplicate") {
      setMessage("This product is already in comparison.");
    } else {
      setMessage("This product cannot be compared.");
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        aria-pressed={added}
        aria-label={added ? "Remove from comparison" : "Add to comparison"}
        onClick={handleClick}
        className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-700 ${
          compact ? "max-w-full" : "text-sm"
        }`}
      >
        {added ? <Check size={16} /> : <ArrowLeftRight size={16} />}
        {added ? (compact ? "Added" : "Remove comparison") : "Compare"}
        {added && <X size={14} className="text-zinc-400" />}
      </button>
      {message && (
        <span role="status" className="ml-2 text-xs text-zinc-500">
          {message}
        </span>
      )}
    </div>
  );
}
