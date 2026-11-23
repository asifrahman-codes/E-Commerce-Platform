import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  reviewStats: vi.fn(),
  cachedSummary: vi.fn(),
  approvedReviews: vi.fn(),
  saveSummary: vi.fn(),
  getProductRatingSummary: vi.fn(),
  getApprovedProductReviews: vi.fn(),
  findProductById: vi.fn(),
  generateAIResponse: vi.fn(),
  searchProducts: vi.fn(),
  getAllCategories: vi.fn(),
  getAllBrands: vi.fn(),
}));

vi.mock("../repositories/ai-review-summary.repository.js", () => ({
  getReviewStatistics: mocks.reviewStats,
  getCachedSummary: mocks.cachedSummary,
  getApprovedReviewsForSummary: mocks.approvedReviews,
  saveSummary: mocks.saveSummary,
  deleteCachedSummary: vi.fn(),
}));

vi.mock("../services/ai.service.js", () => ({
  generateAIResponse: mocks.generateAIResponse,
}));

vi.mock("../services/product-discovery.service.js", () => ({
  searchProducts: mocks.searchProducts,
}));

vi.mock("../repositories/review.repository.js", () => ({
  getProductRatingSummary: mocks.getProductRatingSummary,
  getApprovedProductReviews: mocks.getApprovedProductReviews,
  deleteCachedSummary: vi.fn(),
}));

vi.mock("../repositories/product.repository.js", () => ({
  findProductById: mocks.findProductById,
}));

vi.mock("../repositories/category.repository.js", () => ({
  getAllCategories: mocks.getAllCategories,
}));

vi.mock("../repositories/brand.repository.js", () => ({
  getAllBrands: mocks.getAllBrands,
}));

import { getProductReviewSummary } from "../services/ai-review-summary.service.js";
import { searchProductsSemantically } from "../services/semantic-search.service.js";

describe("AI feature services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findProductById.mockResolvedValue({ product_id: 12 });
  });

  it("rejects invalid review product IDs", async () => {
    await expect(getProductReviewSummary("abc")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("does not analyze pending or rejected reviews", async () => {
    mocks.getProductRatingSummary.mockResolvedValue({
      total_reviews: 0,
      average_rating: 0,
      last_review_at: null,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });

    await expect(getProductReviewSummary("12")).resolves.toMatchObject({
      product_id: 12,
      ai_summary: null,
    });
  });

  it("returns an insufficient-review state below three approved reviews", async () => {
    mocks.getProductRatingSummary.mockResolvedValue({
      total_reviews: 2,
      average_rating: 4,
      last_review_at: "2026-11-22",
      distribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
    });

    await expect(getProductReviewSummary("12")).resolves.toMatchObject({
      insufficient_reviews: true,
      ai_summary: null,
    });
  });

  it("falls back to traditional keyword product search when AI interpretation fails", async () => {
    mocks.getAllCategories.mockRejectedValue(new Error("catalog unavailable"));
    mocks.searchProducts.mockResolvedValue({
      products: [{ product_id: 7, name: "Running Shoes" }],
      pagination: { page: 1, limit: 12, total_items: 1 },
    });

    const result = await searchProductsSemantically("comfortable shoes", {
      page: 1,
      limit: 12,
    });

    expect(result.fallback_used).toBe(true);
    expect(result.products).toEqual([{ product_id: 7, name: "Running Shoes" }]);
  });

  it("rejects invalid semantic search input", async () => {
    await expect(searchProductsSemantically("")).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
