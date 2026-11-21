import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../database/index.js", () => ({
  pool: {
    execute: vi.fn(),
    query: vi.fn(),
  },
}));

import { pool } from "../database/index.js";
import { searchProducts } from "../repositories/product-discovery.repository.js";

describe("product discovery repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pool.execute.mockResolvedValue([[{ total: 1 }], []]);
    pool.query.mockResolvedValue([[{ product_id: 1 }], []]);
  });

  it("uses bound search/filter values and variant-aware best-selling queries", async () => {
    const result = await searchProducts({
      q: "shoe",
      categoryId: 4,
      brandId: 8,
      minPrice: 20,
      maxPrice: 80,
      inStock: true,
      sort: "best_selling",
      limit: 12,
      offset: 0,
    });

    const [countSql, countParams] = pool.execute.mock.calls[0];
    const [productsSql, productParams] = pool.query.mock.calls[0];

    expect(countSql).toContain("MATCH(p.name, p.description, p.slug)");
    expect(countSql).toContain("EXISTS");
    expect(countSql).toContain("available_variant.stock > 0");
    expect(productsSql).toContain("o.status = 'DELIVERED'");
    expect(productsSql).toContain("ORDER BY units_sold DESC");
    expect((countSql.match(/\?/g) ?? []).length).toBe(countParams.length);
    expect(countParams).toEqual([
      "+shoe*",
      "+shoe*",
      "%shoe%",
      "+shoe*",
      "%shoe%",
      4,
      8,
      20,
      80,
    ]);
    expect((productsSql.match(/\?/g) ?? []).length).toBe(productParams.length);
    expect(result).toEqual({
      products: [{ product_id: 1 }],
      total: 1,
    });
  });
});
