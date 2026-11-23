import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  generateAIResponse: vi.fn(),
  searchProducts: vi.fn(),
  compareProducts: vi.fn(),
}));

vi.mock("../services/ai.service.js", () => ({
  generateAIResponse: mocks.generateAIResponse,
}));

vi.mock("../services/product-discovery.service.js", () => ({
  searchProducts: mocks.searchProducts,
}));

vi.mock("../services/product-comparison.service.js", () => ({
  compareProducts: mocks.compareProducts,
}));

import { processShoppingMessage } from "../services/ai-shopping-assistant.service.js";

describe("AI shopping assistant discovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("treats Find products for me as broad discovery", async () => {
    mocks.generateAIResponse.mockResolvedValue(
      "not valid json"
    );
    mocks.searchProducts.mockResolvedValue({
      products: [{ product_id: 9, name: "Popular Product", display_price: 5000, in_stock: 1, total_stock: 5 }],
      pagination: { total_items: 1 },
    });

    const result = await processShoppingMessage({
      message: "Find products for me",
    });

    expect(mocks.searchProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        q: "",
        in_stock: true,
        sort: "popularity",
      })
    );
    expect(result.reply).toContain("popular in-stock products");
  });

  it("extracts an Rs budget for a specific laptop query", async () => {
    mocks.generateAIResponse.mockResolvedValue(
      "not valid json"
    );
    mocks.searchProducts.mockResolvedValue({
      products: [],
      pagination: { total_items: 0 },
    });

    const result = await processShoppingMessage({
      message: "Find laptop under Rs.30000",
    });

    expect(mocks.searchProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        q: "laptop",
        max_price: 30000,
      })
    );
    expect(result.reply).toContain("under Rs");
  });
});
