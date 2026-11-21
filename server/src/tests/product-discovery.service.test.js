import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../repositories/product-discovery.repository.js", () => ({
  searchProducts: vi.fn(),
}));

import * as productDiscoveryRepository from "../repositories/product-discovery.repository.js";
import { searchProducts } from "../services/product-discovery.service.js";

describe("product discovery service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates filters and returns consistent pagination metadata", async () => {
    productDiscoveryRepository.searchProducts.mockResolvedValue({
      products: [{ product_id: 7 }],
      total: 21,
    });

    const result = await searchProducts({
      q: "running shoes",
      brand_id: "3",
      in_stock: "true",
      sort: "best_selling",
      page: "2",
      limit: "10",
    });

    expect(productDiscoveryRepository.searchProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        q: "running shoes",
        brandId: 3,
        inStock: true,
        sort: "best_selling",
        offset: 10,
      })
    );
    expect(result.pagination).toEqual({
      page: 2,
      limit: 10,
      total_items: 21,
      total_pages: 3,
      has_next_page: true,
      has_previous_page: true,
    });
  });

  it("rejects oversized or control-character search input", async () => {
    await expect(searchProducts({ q: "x".repeat(101) })).rejects.toMatchObject({
      statusCode: 400,
    });
    await expect(searchProducts({ q: "shirt\u0000" })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects invalid price ranges and unsupported sorting", async () => {
    await expect(
      searchProducts({ min_price: "20", max_price: "10" })
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(searchProducts({ sort: "untrusted_sql" })).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
