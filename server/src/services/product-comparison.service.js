import ApiError from "../utils/ApiError.js";
import { getProductsForComparison } from "../repositories/product-comparison.repository.js";

export const MAX_COMPARISON_PRODUCTS = 4;
const MAX_PRODUCT_ID = 2_147_483_647;

export function parseComparisonProductIds(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(400, "Provide product IDs to compare.");
  }

  const rawIds = value.split(",");

  if (rawIds.length > MAX_COMPARISON_PRODUCTS) {
    throw new ApiError(
      400,
      `You can compare up to ${MAX_COMPARISON_PRODUCTS} products.`
    );
  }

  const ids = rawIds.map((rawId) => {
    if (!/^[1-9]\d*$/.test(rawId)) {
      throw new ApiError(400, "Product IDs must be positive integers.");
    }

    const id = Number(rawId);
    if (!Number.isSafeInteger(id) || id > MAX_PRODUCT_ID) {
      throw new ApiError(400, "Product ID is too large.");
    }

    return id;
  });

  if (new Set(ids).size !== ids.length) {
    throw new ApiError(400, "Duplicate products cannot be compared.");
  }

  return ids;
}

function uniqueValues(variants, key) {
  return [...new Set(
    variants
      .map((variant) => String(variant[key] ?? "").trim())
      .filter(Boolean)
  )];
}

export async function compareProducts(rawIds) {
  const productIds = parseComparisonProductIds(rawIds);
  const { products, variants } =
    await getProductsForComparison(productIds);

  if (products.length !== productIds.length) {
    throw new ApiError(
      404,
      "One or more products are unavailable for comparison."
    );
  }

  const variantsByProduct = new Map(
    productIds.map((productId) => [productId, []])
  );

  for (const variant of variants) {
    const productVariants = variantsByProduct.get(
      Number(variant.product_id)
    );
    if (!productVariants) continue;

    productVariants.push({
      ...variant,
      price_adjustment: Number(variant.price_adjustment ?? 0),
      final_price: Number(variant.final_price),
      stock: Number(variant.stock),
    });
  }

  const productsById = new Map(
    products.map((product) => [Number(product.product_id), product])
  );

  return productIds.map((productId) => {
    const product = productsById.get(productId);
    const productVariants = variantsByProduct.get(productId) ?? [];
    const prices = productVariants.map((variant) => variant.final_price);
    const basePrice = Number(product.base_price);
    const priceMin = prices.length
      ? prices.reduce((minimum, price) => Math.min(minimum, price))
      : basePrice;
    const priceMax = prices.length
      ? prices.reduce((maximum, price) => Math.max(maximum, price))
      : basePrice;

    return {
      ...product,
      product_id: Number(product.product_id),
      base_price: basePrice,
      price_min: priceMin,
      price_max: priceMax,
      variants: productVariants,
      total_stock: productVariants.reduce(
        (total, variant) => total + variant.stock,
        0
      ),
      available: productVariants.some((variant) => variant.stock > 0),
      available_attributes: {
        sizes: uniqueValues(productVariants, "size"),
        colors: uniqueValues(productVariants, "color"),
        skus: uniqueValues(productVariants, "sku"),
      },
    };
  });
}
