import ApiError from "../utils/ApiError.js";
import * as recommendationRepository from "../repositories/recommendation.repository.js";
import { generateAIResponse } from "./ai.service.js";

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 12;
const MAX_RECENTLY_VIEWED = 8;
const MAX_PRODUCT_ID = 2_147_483_647;
const AI_RECOMMENDATION_CACHE = new Map();
const AI_RECOMMENDATION_CACHE_TTL_MS = 5 * 60 * 1000;

export function invalidatePersonalizedRecommendationCache(userId) {
  if (userId !== undefined && userId !== null) {
    const prefix = `${String(userId)}:`;
    for (const key of AI_RECOMMENDATION_CACHE.keys()) {
      if (key.startsWith(prefix)) AI_RECOMMENDATION_CACHE.delete(key);
    }
    return;
  }
  AI_RECOMMENDATION_CACHE.clear();
}

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

function parsePersonalizedRecentIds(value) {
  if (value === undefined || value === "") return [];
  if (typeof value !== "string") {
    throw new ApiError(400, "Recently viewed product IDs must be a comma-separated list.");
  }
  const rawIds = value.split(",");
  if (rawIds.length > 8) {
    throw new ApiError(400, "At most 8 recently viewed products may be requested.");
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
  const recentlyViewedIds = parsePersonalizedRecentIds(query.recent_ids);
  const cacheKey = `${customerId}:${limit}:${recentlyViewedIds.join(",")}`;
  const cached = AI_RECOMMENDATION_CACHE.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { ...cached.data, cached: true };
  }

  const products = recentlyViewedIds.length
    ? await recommendationRepository.getPersonalizedProducts(
        customerId,
        limit,
        recentlyViewedIds
      )
    : await recommendationRepository.getPersonalizedProducts(
        customerId,
        limit
      );

  if (!products.length) {
    const result = {
      products: [],
      source: "database",
      personalized: false,
      message: "No suitable personalized recommendations are available right now.",
    };
    AI_RECOMMENDATION_CACHE.set(cacheKey, {
      data: result,
      expiresAt: Date.now() + AI_RECOMMENDATION_CACHE_TTL_MS,
    });
    return { ...result, cached: false };
  }

  try {
    const candidates = products.map((product) => ({
      product_id: product.product_id,
      name: product.name,
      category: product.category_name,
      brand: product.brand_name,
      price: product.display_price,
    }));

    const response = await generateAIResponse({
      temperature: 0.2,
      systemInstruction: `You rank real ShopSphere products.
Return only JSON.
Use only supplied product IDs.
Never invent products or product details.
Give one short reason per returned product.
`,
      prompt: `AVAILABLE PRODUCTS:
${JSON.stringify(candidates)}

Rank the best ${limit} products for a customer who has purchased these category and brand preferences.
Return:
{"recommendations":[{"product_id":123,"reason":"short reason"}]}
`,
    });

    const cleaned = response
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    if (!parsed || !Array.isArray(parsed.recommendations)) {
      throw new Error("Invalid AI recommendation response.");
    }

    const candidateMap = new Map(
      products.map((product) => [String(product.product_id), product])
    );
    const used = new Set();
    const ranked = [];

    for (const item of parsed.recommendations) {
      const productId = String(item?.product_id);
      if (used.has(productId)) continue;
      const product = candidateMap.get(productId);
      if (!product) continue;
      used.add(productId);
      ranked.push({
        ...product,
        recommendation_reason:
          typeof item.reason === "string" && item.reason.trim()
            ? item.reason.trim().slice(0, 300)
            : "Selected based on your shopping preferences.",
      });
      if (ranked.length >= limit) break;
    }

    for (const product of products) {
      if (ranked.length >= limit) break;
      const productId = String(product.product_id);
      if (used.has(productId)) continue;
      used.add(productId);
      ranked.push({
        ...product,
        recommendation_reason: "Matches categories or brands associated with your purchases.",
      });
    }

    const result = {
      products: ranked,
      source: "openrouter",
      personalized: true,
      message: "Personalized recommendations generated successfully.",
    };
    AI_RECOMMENDATION_CACHE.set(cacheKey, {
      data: result,
      expiresAt: Date.now() + AI_RECOMMENDATION_CACHE_TTL_MS,
    });
    return { ...result, cached: false };
  } catch (error) {
    const result = {
      products,
      source: "database_fallback",
      personalized: true,
      message: "Recommendations generated using your shopping activity.",
    };
    AI_RECOMMENDATION_CACHE.set(cacheKey, {
      data: result,
      expiresAt: Date.now() + AI_RECOMMENDATION_CACHE_TTL_MS,
    });
    return { ...result, cached: false };
  }
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
