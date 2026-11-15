import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";

import {
  getImageUrl,
  formatPrice,
} from "../../utils/product.utils";

export default function CartSummary({ cart }) {
  const hasItems = cart.items.length > 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
        Order Summary
      </h2>

      <div className="mt-6 space-y-4">
        <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <span>Items ({cart.total_items})</span>
          <span>{formatPrice(cart.subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>

        <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
          <div className="flex justify-between">
            <span className="font-semibold text-zinc-900 dark:text-white">
              Subtotal
            </span>

            <span className="text-lg font-bold text-zinc-900 dark:text-white">
              {formatPrice(cart.subtotal)}
            </span>
          </div>
        </div>
      </div>

      <Link
        to="/checkout"
        aria-disabled={!hasItems}
        onClick={(event) => {
          if (!hasItems) event.preventDefault();
        }}
        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white transition ${
          hasItems
            ? "bg-indigo-600 hover:bg-indigo-700"
            : "cursor-not-allowed bg-zinc-400"
        }`}
      >
        Proceed to Checkout
        <ArrowRight size={18} />
      </Link>

      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-500">
        <ShieldCheck size={16} />
        Secure checkout
      </div>
    </div>
  );
}