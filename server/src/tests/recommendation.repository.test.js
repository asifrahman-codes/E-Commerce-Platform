import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../database/index.js", () => ({
  pool: { query: vi.fn() },
}));

import { pool } from "../database/index.js";
import {
  getBestSellingProducts,
  getFrequentlyBoughtTogetherProducts,
  getPersonalizedProducts,
} from "../repositories/recommendation.repository.js";

describe("recommendation repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pool.query.mockResolvedValue([[], []]);
  });

  it("ranks only in-stock active products by delivered-order quantities", async () => {
    await getBestSellingProducts(8);

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toContain("SUM(item.quantity) AS units_sold");
    expect(sql).toContain("sales_order.status = 'DELIVERED'");
    expect(sql).toContain("candidate.status = 'ACTIVE'");
    expect(sql).toContain("available_variant.stock > 0");
    expect(sql).toContain("ORDER BY units_sold DESC");
    expect(sql).toContain("LIMIT ?");
    expect(params).toEqual([8]);
  });

  it("derives purchase preferences and excludes products already delivered to that user", async () => {
    await getPersonalizedProducts(27, 6);

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toContain("preference_product.category_id");
    expect(sql).toContain("preference_product.brand_id");
    expect(sql).toContain("purchased_order.user_id = ?");
    expect(sql).toContain("purchased_variant.product_id = p.product_id");
    expect(sql).toContain("purchased_order.status = 'DELIVERED'");
    expect(params).toEqual([27, 27, 27, 6]);
  });

  it("finds co-purchases through delivered order items without exposing order owners", async () => {
    await getFrequentlyBoughtTogetherProducts(12, 8);

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toContain("target_order.status = 'DELIVERED'");
    expect(sql).toContain("source_item.order_id = target_order.order_id");
    expect(sql).toContain("source_variant.product_id = ?");
    expect(sql).toContain("COUNT(DISTINCT target_order.order_id)");
    expect(params).toEqual([12, 12, 8]);
  });
});
