
import { useEffect, useMemo, useState } from "react";
import { Check, Package, AlertCircle } from "lucide-react";

import { formatPrice } from "../../utils/product.utils";

export default function VariantSelector({
    variants = [],
    basePrice = 0,
    initialVariantId = null,
    onVariantChange,
}) {
    const activeVariants = useMemo(
        () =>
            variants.filter(
                (variant) =>
                    String(variant.status).toUpperCase() === "ACTIVE"
            ),
        [variants]
    );

    const [selectedVariantId, setSelectedVariantId] = useState(null);

    // Honor a requested in-stock variant, then fall back to a usable default.
    useEffect(() => {
        const requestedVariant = activeVariants.find(
            (variant) =>
                Number(variant.variant_id) === Number(initialVariantId) &&
                Number(variant.stock) > 0
        );
        const firstAvailable = activeVariants.find(
            (variant) => Number(variant.stock) > 0
        );

        const firstVariant = requestedVariant || firstAvailable || activeVariants[0];

        setSelectedVariantId(
            firstVariant?.variant_id ?? null
        );
    }, [activeVariants, initialVariantId]);

    const selectedVariant = useMemo(
        () =>
            activeVariants.find(
                (variant) =>
                    Number(variant.variant_id) ===
                    Number(selectedVariantId)
            ) || null,
        [activeVariants, selectedVariantId]
    );

    // Get available sizes.
    const sizes = useMemo(
        () => [
            ...new Set(
                activeVariants
                    .map((variant) => variant.size)
                    .filter(Boolean)
            ),
        ],
        [activeVariants]
    );

    // Get available colors.
    const colors = useMemo(
        () => [
            ...new Set(
                activeVariants
                    .map((variant) => variant.color)
                    .filter(Boolean)
            ),
        ],
        [activeVariants]
    );

    const selectVariant = (variant) => {
        setSelectedVariantId(variant.variant_id);
    };

    const handleSizeChange = (size) => {
        const matchingVariants = activeVariants.filter(
            (variant) => variant.size === size
        );

        const nextVariant =
            matchingVariants.find(
                (variant) =>
                    Number(variant.stock) > 0 &&
                    (
                        !selectedVariant?.color ||
                        variant.color === selectedVariant.color
                    )
            ) ||
            matchingVariants.find(
                (variant) => Number(variant.stock) > 0
            ) ||
            matchingVariants[0];

        if (nextVariant) {
            selectVariant(nextVariant);
        }
    };

    const handleColorChange = (color) => {
        const matchingVariants = activeVariants.filter(
            (variant) => variant.color === color
        );

        const nextVariant =
            matchingVariants.find(
                (variant) =>
                    Number(variant.stock) > 0 &&
                    (
                        !selectedVariant?.size ||
                        variant.size === selectedVariant.size
                    )
            ) ||
            matchingVariants.find(
                (variant) => Number(variant.stock) > 0
            ) ||
            matchingVariants[0];

        if (nextVariant) {
            selectVariant(nextVariant);
        }
    };

    // Notify parent whenever the selected variant changes.
    useEffect(() => {
        onVariantChange?.(selectedVariant);
    }, [selectedVariant, onVariantChange]);

    if (!activeVariants.length) {
        return (
            <div className="rounded-lg border border-zinc-200 p-4 text-sm font-medium text-zinc-700 dark:border-zinc-800">
                No variants are currently available for this product.
            </div>
        );
    }

    const finalPrice = selectedVariant
        ? Number(selectedVariant.product_price ?? basePrice) +
          Number(selectedVariant.price_adjustment ?? 0)
        : Number(basePrice);

    const stock = Number(selectedVariant?.stock ?? 0);

    const inputClass =
        "min-h-11 rounded-lg border px-3 py-2 text-sm transition";

    return (
        <div className="space-y-5">

            {/* Size Selection */}

            {sizes.length > 0 && (
                <div>
                    <h3 className="mb-3 text-sm font-semibold text-zinc-900">
                        Select Size / Storage
                    </h3>

                    <div className="flex flex-wrap gap-2">
                        {sizes.map((size) => {
                            const isSelected =
                                selectedVariant?.size === size;

                            const hasStock = activeVariants.some(
                                (variant) =>
                                    variant.size === size &&
                                    Number(variant.stock) > 0
                            );

                            return (
                                <button
                                    key={size}
                                    type="button"
                                    disabled={!hasStock}
                                    onClick={() => handleSizeChange(size)}
                                    className={`${inputClass} ${
                                        isSelected
                                            ? "border-indigo-600 bg-indigo-600 text-white"
                                            : "border-zinc-300 text-zinc-700 hover:border-indigo-500 dark:border-zinc-700 dark:text-zinc-300"
                                    } disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-600`}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Color Selection */}

            {colors.length > 0 && (
                <div>
                    <h3 className="mb-3 text-sm font-semibold text-zinc-900">
                        Select Color
                    </h3>

                    <div className="flex flex-wrap gap-2">
                        {colors.map((color) => {
                            const isSelected =
                                selectedVariant?.color === color;

                            const hasStock = activeVariants.some(
                                (variant) =>
                                    variant.color === color &&
                                    Number(variant.stock) > 0
                            );

                            return (
                                <button
                                    key={color}
                                    type="button"
                                    disabled={!hasStock}
                                    onClick={() => handleColorChange(color)}
                                    className={`${inputClass} ${
                                        isSelected
                                            ? "border-indigo-600 bg-indigo-600 text-white"
                                            : "border-zinc-300 text-zinc-700 hover:border-indigo-500 dark:border-zinc-700 dark:text-zinc-300"
                                    } disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-600`}
                                >
                                    {color}
                                    {isSelected && (
                                        <Check
                                            size={14}
                                            className="ml-1 inline"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Selected Variant Information */}

            {selectedVariant && (
                <div className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-sm font-medium text-zinc-700">
                            Selected SKU
                        </span>

                        <span className="min-w-0 break-all text-right text-sm font-medium text-zinc-900">
                            {selectedVariant.sku}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-sm font-medium text-zinc-700">
                            Price
                        </span>

                        <span className="text-lg font-bold text-indigo-600">
                            {formatPrice(finalPrice)}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-sm font-medium text-zinc-700">
                            Stock
                        </span>

                        <span
                            className={`flex items-center gap-1 text-sm font-medium ${
                                stock > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                            }`}
                        >
                            {stock > 0 ? (
                                <>
                                    <Package size={15} />
                                    {stock} available
                                </>
                            ) : (
                                <>
                                    <AlertCircle size={15} />
                                    Out of stock
                                </>
                            )}
                        </span>
                    </div>

                </div>
            )}

        </div>
    );
}
