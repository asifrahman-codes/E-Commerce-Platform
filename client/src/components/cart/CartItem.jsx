import { useState } from "react";
import { Minus, Package, Plus, Trash2 } from "lucide-react";

import {
  getImageUrl,
  formatPrice,
  getResponsiveImageProps,
} from "../../utils/product.utils";
import SafeImage from "../common/SafeImage";

export default function CartItem({
  item,
  onUpdate,
  onRemove,
}) {
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  const stock = Number(item.stock);
  const quantity = Number(item.quantity);

  const handleQuantityChange = async (newQuantity) => {
    if (
      newQuantity < 1 ||
      newQuantity > stock ||
      newQuantity === quantity
    ) {
      return;
    }

    try {
      setUpdating(true);
      setError("");

      await onUpdate(item.cart_item_id, newQuantity);
    } catch (err) {
      setError(
        err.message ||
          "Could not update quantity."
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    try {
      setRemoving(true);
      setError("");

      await onRemove(item.cart_item_id);
    } catch (err) {
      setError(
        err.message ||
          "Could not remove this item."
      );
    } finally {
      setRemoving(false);
    }
  };

  const unavailable =
    item.variant_status !== "ACTIVE" || stock <= 0;

  return (
    <div className="flex flex-col gap-4 py-6 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
      <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f2f4ef] sm:w-28">
        {getImageUrl(item.primary_image_url) ? (
          <SafeImage
            {...getResponsiveImageProps(item.primary_image_url, {
              sizes: "(min-width: 640px) 112px, 100vw",
              widths: [128, 256, 384],
              fallbackWidth: 256,
            })}
            alt={item.product_name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain p-2"
            fallbackSize={32}
          />
        ) : (
          <Package size={32} strokeWidth={1.2} className="text-[#b9c3ba]" aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-ink">
          {item.product_name}
        </h3>

        <div className="mt-1 space-y-1 text-sm text-zinc-500">
          {item.size && <p>Size: {item.size}</p>}
          {item.color && <p>Color: {item.color}</p>}
          {item.sku && <p>SKU: {item.sku}</p>}
        </div>

        <p className="mt-3 font-semibold text-ink">
          {formatPrice(item.unit_price)}
        </p>

        {unavailable && (
          <p className="mt-2 text-sm text-red-600">
            This variant is currently unavailable.
          </p>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <div className="flex items-center rounded-full border border-line bg-white">
          <button
            type="button"
            disabled={updating || quantity <= 1 || unavailable}
            onClick={() => handleQuantityChange(quantity - 1)}
            className="inline-flex h-11 w-11 items-center justify-center text-zinc-600 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-300"
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>

          <span className="min-w-8 text-center text-sm font-medium text-ink">
            {quantity}
          </span>

          <button
            type="button"
            disabled={updating || quantity >= stock || unavailable}
            onClick={() => handleQuantityChange(quantity + 1)}
            className="inline-flex h-11 w-11 items-center justify-center text-zinc-600 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-300"
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="text-right">
          <p className="font-semibold text-ink">
            {formatPrice(item.item_subtotal)}
          </p>

          <button
            type="button"
            disabled={removing}
            onClick={handleRemove}
            className="mt-2 inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            <Trash2 size={15} />
            {removing ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}