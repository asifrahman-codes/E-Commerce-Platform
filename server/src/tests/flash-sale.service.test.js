import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  countCustomerTargetPurchases: vi.fn(),
  findActiveProduct: vi.fn(),
  findApplicableFlashTargets: vi.fn(),
  findExistingTargetsInWindow: vi.fn(),
  findFlashSaleForUpdate: vi.fn(),
  findFlashSaleTargets: vi.fn(),
  findVariantForSaleTarget: vi.fn(),
  insertFlashSale: vi.fn(),
  insertFlashSaleRedemption: vi.fn(),
  insertFlashSaleTarget: vi.fn(),
  listAdminFlashSales: vi.fn(),
  listPublicFlashSaleTargets: vi.fn(),
  releaseFlashSaleRedemptions: vi.fn(),
  replaceFlashSaleTargets: vi.fn(),
  updateFlashSale: vi.fn(),
}));

vi.mock("../repositories/flash-sale.repository.js", () => m);

import {
  calculateFlashSalePrice,
  recordFlashSaleRedemptions,
  resolveFlashSalesForItems,
} from "../services/flash-sale.service.js";

beforeEach(() => {
  vi.clearAllMocks();
  m.findApplicableFlashTargets.mockResolvedValue([{
    target_id: 3,
    title: "Weekend deal",
    discount_type: "PERCENTAGE",
    discount_value: "10",
    per_customer_limit: null,
  }]);
  m.countCustomerTargetPurchases.mockResolvedValue(0);
});

describe("calculateFlashSalePrice", () => {
  it("applies percentage discounts to the current variant price", () => {
    expect(calculateFlashSalePrice(2500, "PERCENTAGE", 20)).toEqual({
      discount: 500,
      salePrice: 2000,
    });
  });

  it("caps a fixed discount so the sale price never becomes negative", () => {
    expect(calculateFlashSalePrice(75, "FIXED", 100)).toEqual({
      discount: 75,
      salePrice: 0,
    });
  });

  it("calculates variant-aware cart prices and enforces the customer quantity limit", async () => {
    const item = {
      product_id: 4,
      variant_id: 8,
      product_price: "1000.00",
      price_adjustment: "100.00",
      quantity: 2,
    };
    const result = await resolveFlashSalesForItems({}, [item], 9);
    expect(result).toMatchObject({
      discount: 220,
      has_flash_sale: true,
    });
    expect(result.items[0].unitPrice).toBe(990);

    m.findApplicableFlashTargets.mockResolvedValue([{
      target_id: 3,
      title: "Weekend deal",
      discount_type: "PERCENTAGE",
      discount_value: "10",
      per_customer_limit: 3,
    }]);
    m.countCustomerTargetPurchases.mockResolvedValue(2);
    await expect(resolveFlashSalesForItems({}, [item], 9)).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});

it("records quantities, final discounts, and campaign terms for audit", async () => {
  const target = {
    target_id: 3,
    discount_type: "PERCENTAGE",
    discount_value: "10",
  };
  await recordFlashSaleRedemptions({}, [
    { target, item: { quantity: 2 }, discount: 20 },
    { target, item: { quantity: 1 }, discount: 10 },
  ], 9, 41);

  expect(m.insertFlashSaleRedemption).toHaveBeenCalledWith({}, {
    targetId: 3,
    userId: 9,
    orderId: 41,
    quantity: 3,
    discountAmount: 30,
    discountType: "PERCENTAGE",
    discountValue: "10",
  });
});
