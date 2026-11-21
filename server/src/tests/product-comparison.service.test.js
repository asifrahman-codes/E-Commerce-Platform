import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../repositories/product-comparison.repository.js", () => ({
  getProductsForComparison: vi.fn(),
}));

import * as comparisonRepository from "../repositories/product-comparison.repository.js";
import {
  compareProducts,
  parseComparisonProductIds,
} from "../services/product-comparison.service.js";

describe("product comparison service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates positive unique IDs and enforces the four-product limit", () => {
    expect(parseComparisonProductIds("12,34")).toEqual([12, 34]);
    expect(() => parseComparisonProductIds("12,12")).toThrow(
      "Duplicate products cannot be compared."
    );
    expect(() => parseComparisonProductIds("0")).toThrow(
      "Product IDs must be positive integers."
    );
    expect(() => parseComparisonProductIds("1,2,3,4,5")).toThrow(
      "You can compare up to 4 products."
    );
    expect(() => parseComparisonProductIds("1e3")).toThrow(
      "Product IDs must be positive integers."
    );
    expect(() => parseComparisonProductIds("2147483648")).toThrow(
      "Product ID is too large."
    );
  });

  it("returns current product and active-variant data in requested order", async () => {
    comparisonRepository.getProductsForComparison.mockResolvedValue({
      products: [
        {
          product_id: 34,
          name: "Second",
          base_price: "100.00",
          category_name: "Shoes",
          brand_name: "Brand B",
        },
        {
          product_id: 12,
          name: "First",
          base_price: "50.00",
          category_name: "Clothing",
          brand_name: "Brand A",
        },
      ],
      variants: [
        {
          product_id: 34,
          variant_id: 341,
          sku: "B-1",
          size: "M",
          color: "Blue",
          price_adjustment: "10.00",
          final_price: "110.00",
          stock: 3,
        },
        {
          product_id: 34,
          variant_id: 342,
          sku: "B-2",
          size: "L",
          color: "Blue",
          price_adjustment: "20.00",
          final_price: "120.00",
          stock: 2,
        },
        {
          product_id: 12,
          variant_id: 121,
          sku: "A-1",
          size: null,
          color: "Red",
          price_adjustment: null,
          final_price: "50.00",
          stock: 0,
        },
      ],
    });

    const result = await compareProducts("12,34");

    expect(result.map((product) => product.product_id)).toEqual([12, 34]);
    expect(result[0]).toMatchObject({
      price_min: 50,
      price_max: 50,
      total_stock: 0,
      available: false,
      available_attributes: { sizes: [], colors: ["Red"], skus: ["A-1"] },
    });
    expect(result[1]).toMatchObject({
      price_min: 110,
      price_max: 120,
      total_stock: 5,
      available: true,
      available_attributes: {
        sizes: ["M", "L"],
        colors: ["Blue"],
        skus: ["B-1", "B-2"],
      },
    });
    expect(comparisonRepository.getProductsForComparison)
      .toHaveBeenCalledWith([12, 34]);
  });

  it("rejects product IDs that do not resolve to active products", async () => {
    comparisonRepository.getProductsForComparison.mockResolvedValue({
      products: [],
      variants: [],
    });

    await expect(compareProducts("12")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
