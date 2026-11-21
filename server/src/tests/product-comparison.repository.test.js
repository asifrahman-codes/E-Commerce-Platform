import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../database/index.js", () => ({
  pool: { query: vi.fn() },
}));

import { pool } from "../database/index.js";
import { getProductsForComparison } from "../repositories/product-comparison.repository.js";

describe("product comparison repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses bounded queries for products and their active variants", async () => {
    pool.query
      .mockResolvedValueOnce([[{ product_id: 4 }], []])
      .mockResolvedValueOnce([[{ variant_id: 9 }], []]);

    const result = await getProductsForComparison([4, 7]);

    expect(pool.query).toHaveBeenCalledTimes(2);
    const [productsSql, productsParams] = pool.query.mock.calls[0];
    const [variantsSql, variantsParams] = pool.query.mock.calls[1];
    expect(productsSql).toContain("p.product_id IN (?, ?)");
    expect(productsSql).toContain("p.status = 'ACTIVE'");
    expect(productsParams).toEqual([4, 7]);
    expect(variantsSql).toContain("pv.status = 'ACTIVE'");
    expect(variantsSql).toContain("COALESCE(pv.price_adjustment, 0)");
    expect(variantsParams).toEqual([4]);
    expect(result).toEqual({
      products: [{ product_id: 4 }],
      variants: [{ variant_id: 9 }],
    });
  });
});
