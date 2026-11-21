import ApiError from "../utils/ApiError.js";
import * as recommendationRepository from "../repositories/recommendation.repository.js";

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 12;
const MAX_RECENTLY_VIEWED = 8;
const MAX_PRODUCT_ID = 2_147_483_647;

function parseLimit(value) {
  if (value === undefined || value === "") return DEFAULT_LIMIT;

  if (!/^[1-9]\d*$/.test(String(value))) {
    throw new ApiError(400, "Recommendation limit must be a positive integer.");
  }

  const limit = Number(value);
  if (!Number.isSafeInteger(limit) || limit > MAX_LIMIT) {
    throw new ApiError(400, `Recommendation limit cannot exceed ${MAX_LIMIT}.`);
  }

  return limit;
}

function parseProductId(value) {
  if (!/^[1-9]\d*$/.test(String(value))) {
    throw new ApiError(400, "Product ID must be a positive integer.");
  }

  const productId = Number(value);
  if (!Number.isSafeInteger(productId) || productId > MAX_PRODUCT_ID) {
    throw new ApiError(400, "Product ID is too large.");
  }

  return productId;
}

function parseRecentProductIds(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(400, "Provide recently viewed product IDs.");
  }

  const rawIds = value.split(",");
  if (rawIds.length > MAX_RECENTLY_VIEWED) {
    throw new ApiError(
      400,
      `At most ${MAX_RECENTLY_VIEWED} recently viewed products may be requested.`
    );
  }

  const ids = rawIds.map(parseProductId);
  if (new Set(ids).size !== ids.length) {
    throw new ApiError(400, "Recently viewed product IDs must be unique.");
  }

  return ids;
}

export async function getPublicRecommendations(query = {}) {
  const limit = parseLimit(query.limit);
  const [popular, bestSelling, newArrivals] = await Promise.all([
    recommendationRepository.getPopularProducts(limit),
    recommendationRepository.getBestSellingProducts(limit),
    recommendationRepository.getNewArrivalProducts(limit),
  ]);

  return {
    popular,
    best_selling: bestSelling,
    new_arrivals: newArrivals,
  };
}

export async function getPersonalizedRecommendations(userId, query = {}) {
  const customerId = parseProductId(String(userId));
  const limit = parseLimit(query.limit);
  const products = await recommendationRepository.getPersonalizedProducts(
    customerId,
    limit
  );
  return { products };
}

export async function getProductRecommendations(rawProductId, query = {}) {
  const productId = parseProductId(String(rawProductId));
  const limit = parseLimit(query.limit);

  const grouped = await recommendationRepository.getRelatedProducts(
    productId,
    limit
  );

  if (!grouped) {
    throw new ApiError(404, "Product not found.");
  }

  const frequentlyBoughtTogether =
    await recommendationRepository.getFrequentlyBoughtTogetherProducts(
      productId,
      limit
    );

  return {
    related: grouped.related,
    similar_by_brand: grouped.similarByBrand,
    frequently_bought_together: frequentlyBoughtTogether,
  };
}

export async function getRecentlyViewedRecommendations(rawIds) {
  const productIds = parseRecentProductIds(rawIds);
  const products = await recommendationRepository.getProductsByIds(productIds);
  return { products };
}
