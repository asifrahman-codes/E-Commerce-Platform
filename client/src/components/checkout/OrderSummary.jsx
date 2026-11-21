import { useState } from "react";
import { Tag, X, Loader2, ShieldCheck, Lock } from "lucide-react";

import { formatPrice, getResponsiveImageProps } from "../../utils/product.utils";

export default function OrderSummary({
  items,
  preview,
  previewLoading,
  couponCode,
  couponError,
  onApplyCoupon,
  onRemoveCoupon,
  loyaltyAccount,
  loyaltyAccountError,
  loyaltyPoints,
  loyaltyError,
  onApplyPoints,
  onPlaceOrder,
  placing,
  canPlace,
  buttonLabel,
}) {
  const [input, setInput] = useState("");
  const [pointsInput, setPointsInput] = useState("");
  const discountsLocked = Boolean(preview?.has_flash_sale || loyaltyPoints > 0 || couponCode);
  const additionalDiscount = Math.max(
    0,
    Number(preview?.discount || 0) - Number(preview?.flash_sale_savings || 0)
  );

  const handleApply = (event) => {
    event.preventDefault();
    const code = input.trim();
    if (code) onApplyCoupon(code);
  };

  const threshold = preview?.free_shipping_threshold;
  const showFreeHint =
    preview && Number(preview.shipping) > 0 && threshold != null && Number(threshold) > 0;

  return (
    <div className="shop-panel p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-ink">Order summary</h2>

      <ul className="mt-4 max-h-72 divide-y divide-zinc-100 overflow-y-auto pr-1" aria-label="Items in your order">
        {items.map((item) => (
          <li key={item.cart_item_id} className="flex gap-3 py-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
              {item.primary_image_url && (
                <img
                  {...getResponsiveImageProps(item.primary_image_url, {
                    sizes: "56px",
                    widths: [128, 256],
                    fallbackWidth: 128,
                  })}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
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
            <button type="button" onClick={onRemoveCoupon} aria-label="Remove coupon" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded hover:bg-emerald-100">
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
              disabled={discountsLocked}
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-base uppercase outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
            />
            <button type="submit" disabled={!input.trim() || previewLoading || discountsLocked} className="min-h-11 shrink-0 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50">
              Apply
            </button>
          </div>
        )}
        {couponError && <p role="alert" className="mt-2 text-xs text-red-600">{couponError}</p>}
      </form>

      {(loyaltyAccountError || (loyaltyAccount && Number(loyaltyAccount.balance) > 0)) && (
        <form
          className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3"
          onSubmit={(event) => {
            event.preventDefault();
            const points = Number(pointsInput);
            if (Number.isSafeInteger(points) && points > 0) onApplyPoints(points);
          }}
          aria-label="Redeem reward points"
        >
          {loyaltyAccountError ? (
            <p role="alert" className="text-xs text-red-700">{loyaltyAccountError}</p>
          ) : (
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="font-semibold text-amber-950">Reward points</span>
              <span className="text-amber-800">{Number(loyaltyAccount.balance).toLocaleString()} available</span>
            </div>
          )}
          {loyaltyAccount && Number(loyaltyAccount.balance) > 0 && <>
          {loyaltyPoints > 0 ? (
            <div className="mt-2 flex items-center justify-between gap-2 text-sm text-amber-900">
              <span>{loyaltyPoints.toLocaleString()} points applied</span>
              <button
                type="button"
                onClick={() => onApplyPoints(0)}
                className="font-medium underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-2 flex gap-2">
              <label htmlFor="loyalty-points" className="sr-only">Points to redeem</label>
              <input
                id="loyalty-points"
                type="number"
                min={loyaltyAccount.minimum_redemption_points}
                max={loyaltyAccount.balance}
                step="1"
                value={pointsInput}
                onChange={(event) => setPointsInput(event.target.value)}
                placeholder={`Min ${loyaltyAccount.minimum_redemption_points}`}
                disabled={discountsLocked || previewLoading}
                className="min-h-11 min-w-0 flex-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-base disabled:bg-zinc-100 sm:text-sm"
              />
              <button
                type="submit"
                disabled={!pointsInput || previewLoading || discountsLocked}
                className="min-h-11 shrink-0 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          )}
          {loyaltyError && <p role="alert" className="mt-2 text-xs text-red-700">{loyaltyError}</p>}
          {preview?.loyalty?.discount > 0 && (
            <p className="mt-2 text-xs text-amber-900">
              Points discount: {formatPrice(preview.loyalty.discount)}
            </p>
          )}
          {preview?.has_flash_sale && (
            <p className="mt-2 text-xs text-amber-900">
              Rewards cannot be combined with flash-sale prices or coupons.
            </p>
          )}
          </>}
        </form>
      )}

      <dl className="mt-5 space-y-3 text-sm" aria-live="polite" aria-busy={previewLoading}>
        {preview ? (
          <>
            <Row label="Subtotal" value={formatPrice(preview.subtotal)} />
            {Number(preview.flash_sale_savings) > 0 && (
              <Row label="Flash-sale savings" value={`− ${formatPrice(preview.flash_sale_savings)}`} accent />
            )}
            {additionalDiscount > 0 && (
              <Row
                label={preview.loyalty?.discount > 0 ? "Points discount" : preview.coupon ? "Coupon discount" : "Discount"}
                value={`− ${formatPrice(additionalDiscount)}`}
                accent
              />
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
