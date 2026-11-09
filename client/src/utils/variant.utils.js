export const getVariantId = (variant) =>
  variant?.variant_id;

export const getVariantSize = (variant) =>
  variant?.size ?? "";

export const getVariantColor = (variant) =>
  variant?.color ?? "";

export const getVariantSku = (variant) =>
  variant?.sku ?? "";

export const getVariantStock = (variant) =>
  Number(variant?.stock ?? 0);

export const getVariantPrice = (variant) =>
  Number(
    variant?.final_price ??
    (
      Number(variant?.product_price ?? 0) +
      Number(variant?.price_adjustment ?? 0)
    )
  );

export const getUniqueVariantSizes = (variants = []) =>
  [...new Set(variants.map((variant) => variant.size).filter(Boolean))];

export const getUniqueVariantColors = (variants = []) =>
  [...new Set(variants.map((variant) => variant.color).filter(Boolean))];

export const findMatchingVariant = (
  variants,
  selectedSize,
  selectedColor
) =>
  variants.find(
    (variant) =>
      variant.size === selectedSize &&
      variant.color === selectedColor
  ) ?? null;