import { useState } from "react";
import { Tag, X, Loader2, ShieldCheck, Lock } from "lucide-react";

import { formatPrice } from "../../utils/product.utils";

export default function OrderSummary({
  items,
  preview,
  previewLoading,
  couponCode,
  couponError,
  onApplyCoupon,
  onRemoveCoupon,
  onPlaceOrder,
  placing,
  canPlace,
  buttonLabel,
}) {
  const [input, setInput] = useState("");

  const handleApply = (event) => {
    event.preventDefault();
    const code = input.trim();
    if (code) onApplyCoupon(code);
  };

  const threshold = preview?.free_shipping_threshold;
  const showFreeHint =
    preview && Number(preview.shipping) > 0 && threshold != null && Number(threshold) > 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold text-zinc-900">Order summary</h2>

      <ul className="mt-4 max-h-72 divide-y divide-zinc-100 overflow-y-auto pr-1" aria-label="Items in your order">
        {items.map((item) => (
          <li key={item.cart_item_id} className="flex gap-3 py-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
              {item.primary_image_url && (
                <img src={item.primary_image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
              )}
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-medium text-zinc-900">{item.product_name}</p>
              <p className="text-xs text-zinc-500">
                {[item.size, item.color].filter(Boolean).join(" · ") || item.sku} × {item.quantity}
              </p>
            </div>
            <p className="text-sm font-medium text-zinc-900">{formatPrice(item.item_subtotal)}</p>
          </li>
        ))}
      </ul>

      <form onSubmit={handleApply} className="mt-4" aria-label="Apply coupon">
        {couponCode ? (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            <span className="inline-flex items-center gap-2 font-medium">
              <Tag size={16} /> {couponCode} applied
            </span>
            <button type="button" onClick={onRemoveCoupon} aria-label="Remove coupon" className="rounded p-1 hover:bg-emerald-100">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <label htmlFor="coupon-code" className="sr-only">Coupon code</label>
            <input
              id="coupon-code"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Coupon code"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm uppercase outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <button type="submit" disabled={!input.trim() || previewLoading} className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50">
              Apply
            </button>
          </div>
        )}
        {couponError && <p role="alert" className="mt-2 text-xs text-red-600">{couponError}</p>}
      </form>

      <dl className="mt-5 space-y-3 text-sm" aria-live="polite" aria-busy={previewLoading}>
        {preview ? (
          <>
            <Row label="Subtotal" value={formatPrice(preview.subtotal)} />
            {Number(preview.discount) > 0 && (
              <Row label="Discount" value={`− ${formatPrice(preview.discount)}`} accent />
            )}
            <Row label="Shipping" value={Number(preview.shipping) === 0 ? "Free" : formatPrice(preview.shipping)} />
            {Number(preview.tax) > 0 && <Row label="Tax" value={formatPrice(preview.tax)} />}
            <div className="flex items-baseline justify-between border-t border-zinc-200 pt-4">
              <dt className="font-semibold text-zinc-900">Total</dt>
              <dd className="text-xl font-bold text-zinc-900">{formatPrice(preview.total)}</dd>
            </div>
            {showFreeHint && (
              <p className="text-xs text-zinc-500">Free shipping on orders of {formatPrice(threshold)} or more.</p>
            )}
          </>
        ) : (
          <p className="flex items-center gap-2 text-zinc-500"><Loader2 className="animate-spin" size={16} /> Calculating totals…</p>
        )}
      </dl>

      <button
        type="button"
        onClick={onPlaceOrder}
        disabled={!canPlace || placing || previewLoading}
        className="mt-6 hidden w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 lg:flex"
      >
        {placing ? <><Loader2 className="animate-spin" size={18} /> Placing order…</> : <><Lock size={16} /> {buttonLabel}</>}
      </button>

      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
        <ShieldCheck size={16} /> Prices and totals are confirmed by our server when you place the order.
      </p>
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex justify-between">
      <dt className="text-zinc-600">{label}</dt>
      <dd className={accent ? "font-medium text-emerald-600" : "font-medium text-zinc-900"}>{value}</dd>
    </div>
  );
}
