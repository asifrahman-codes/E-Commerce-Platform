import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPopularProducts: vi.fn(),
  getBestSellingProducts: vi.fn(),
  getNewArrivalProducts: vi.fn(),
  getPersonalizedProducts: vi.fn(),
  getRelatedProducts: vi.fn(),
  getFrequentlyBoughtTogetherProducts: vi.fn(),
  getProductsByIds: vi.fn(),
}));

vi.mock("../repositories/recommendation.repository.js", () => mocks);

import * as recommendationRepository from "../repositories/recommendation.repository.js";
import {
  getPersonalizedRecommendations,
  getProductRecommendations,
  getPublicRecommendations,
  getRecentlyViewedRecommendations,
} from "../services/recommendation.service.js";

describe("recommendation service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns public sales and arrival lists with a bounded limit", async () => {
    mocks.getPopularProducts.mockResolvedValue([{ product_id: 1 }]);
    mocks.getBestSellingProducts.mockResolvedValue([{ product_id: 2 }]);
    mocks.getNewArrivalProducts.mockResolvedValue([{ product_id: 3 }]);

    await expect(getPublicRecommendations({ limit: "6" })).resolves.toEqual({
      popular: [{ product_id: 1 }],
      best_selling: [{ product_id: 2 }],
      new_arrivals: [{ product_id: 3 }],
    });
    expect(mocks.getPopularProducts).toHaveBeenCalledWith(6);
    expect(mocks.getBestSellingProducts).toHaveBeenCalledWith(6);
    expect(mocks.getNewArrivalProducts).toHaveBeenCalledWith(6);
    await expect(getPublicRecommendations({ limit: "1000" }))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it("uses only the authenticated customer ID for personalization", async () => {
    mocks.getPersonalizedProducts.mockResolvedValue([]);

    await expect(
      getPersonalizedRecommendations(29, { limit: "4" })
    ).resolves.toEqual({ products: [] });
    expect(mocks.getPersonalizedProducts).toHaveBeenCalledWith(29, 4);
  });

  it("returns category, brand, and co-purchase results for a valid product", async () => {
    mocks.getRelatedProducts.mockResolvedValue({
      related: [{ product_id: 2 }],
      similarByBrand: [{ product_id: 3 }],
    });
    mocks.getFrequentlyBoughtTogetherProducts.mockResolvedValue([
      { product_id: 4 },
    ]);

    const result = await getProductRecommendations("1");

    expect(result).toEqual({
      related: [{ product_id: 2 }],
      similar_by_brand: [{ product_id: 3 }],
      frequently_bought_together: [{ product_id: 4 }],
    });
    expect(mocks.getFrequentlyBoughtTogetherProducts)
      .toHaveBeenCalledWith(1, 8);
  });

  it("validates and resolves recently viewed IDs without trusting product data from storage", async () => {
    mocks.getProductsByIds.mockResolvedValue([{ product_id: 5 }]);

    await expect(
      getRecentlyViewedRecommendations("5,8")
    ).resolves.toEqual({ products: [{ product_id: 5 }] });
    expect(mocks.getProductsByIds).toHaveBeenCalledWith([5, 8]);

    await expect(getRecentlyViewedRecommendations("5,5"))
      .rejects.toMatchObject({ statusCode: 400 });
    expect(mocks.getProductsByIds).toHaveBeenCalledTimes(1);
  });
});
