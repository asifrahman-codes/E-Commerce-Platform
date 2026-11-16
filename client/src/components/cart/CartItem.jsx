import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";

import {
  getImageUrl,
  formatPrice,
} from "../../utils/product.utils";

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
    <div className="flex flex-col gap-4 border-b border-zinc-200 py-6 sm:flex-row sm:items-center dark:border-zinc-800">
      <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:w-28 dark:bg-zinc-800">
        <img
          src={getImageUrl(item.primary_image_url)}
          alt={item.product_name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-zinc-900 dark:text-white">
          {item.product_name}
        </h3>

        <div className="mt-1 space-y-1 text-sm text-zinc-500">
          {item.size && <p>Size: {item.size}</p>}
          {item.color && <p>Color: {item.color}</p>}
          {item.sku && <p>SKU: {item.sku}</p>}
        </div>

        <p className="mt-3 font-semibold text-zinc-900 dark:text-white">
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
        <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            disabled={updating || quantity <= 1 || unavailable}
            onClick={() => handleQuantityChange(quantity - 1)}
            className="p-2 text-zinc-600 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-300"
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>

          <span className="min-w-8 text-center text-sm font-medium">
            {quantity}
          </span>

          <button
            type="button"
            disabled={updating || quantity >= stock || unavailable}
            onClick={() => handleQuantityChange(quantity + 1)}
            className="p-2 text-zinc-600 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-300"
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="text-right">
          <p className="font-bold text-zinc-900 dark:text-white">
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