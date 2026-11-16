import { describe, it, expect } from "vitest";
import { calculateOrderPricing } from "../utils/pricing.js";

const settings = { currency: "PKR", shipping_fee: "250.00", free_shipping_threshold: "5000.00", tax_rate: "10", tax_enabled: 1 };

describe("calculateOrderPricing", () => {
  it("adds shipping and tax after discount", () => {
    expect(calculateOrderPricing({ subtotal: 1000, discount: 100, settings })).toMatchObject({ subtotal: 1000, discount: 100, shipping: 250, tax: 90, total: 1240 });
  });
  it("gives free shipping at the threshold", () => {
    expect(calculateOrderPricing({ subtotal: 5000, settings }).shipping).toBe(0);
  });
  it("rejects a discount larger than the subtotal", () => {
    expect(() => calculateOrderPricing({ subtotal: 100, discount: 101, settings })).toThrow();
  });
});
