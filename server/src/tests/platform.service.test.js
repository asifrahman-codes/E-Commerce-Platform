import { beforeEach, describe, expect, it, vi } from "vitest";

const repository = vi.hoisted(() => ({
  listActiveBundles: vi.fn(),
  createBundle: vi.fn(),
  subscribeBackInStock: vi.fn(),
  subscribeNewsletter: vi.fn(),
  unsubscribeNewsletter: vi.fn(),
  createWishlistShare: vi.fn(),
  getWishlistShare: vi.fn(),
  createReferralCode: vi.fn(),
  applyReferralCode: vi.fn(),
  listCampaigns: vi.fn(),
  createCampaign: vi.fn(),
  getStoreSetting: vi.fn(),
  setStoreSetting: vi.fn(),
  listAuditLogs: vi.fn(),
  writeAuditLog: vi.fn(),
  getCustomerSegments: vi.fn(),
  getInventoryForecast: vi.fn(),
  getSalesExport: vi.fn(),
}));

vi.mock("../repositories/platform.repository.js", () => repository);

import * as platformService from "../services/platform.service.js";

describe("platform commerce services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates and creates a real product bundle", async () => {
    repository.createBundle.mockResolvedValue(7);
    repository.writeAuditLog.mockResolvedValue();

    await expect(platformService.createBundle({
      name: "Starter bundle",
      discount_type: "PERCENTAGE",
      discount_value: 10,
      items: [{ product_id: 12, quantity: 1 }],
    }, 3)).resolves.toEqual({ bundle_id: 7 });

    expect(repository.createBundle).toHaveBeenCalledWith(expect.objectContaining({
      name: "Starter bundle",
      items: [{ product_id: 12, variant_id: null, quantity: 1 }],
    }));
  });

  it("rejects invalid back-in-stock subscriptions", async () => {
    await expect(platformService.subscribeBackInStock({
      email: "invalid",
      product_id: 12,
    })).rejects.toMatchObject({ statusCode: 400 });
  });

  it("stores newsletter subscriptions with normalized email", async () => {
    await platformService.subscribeNewsletter({ email: "  Customer@Example.COM ", source: "footer" });
    expect(repository.subscribeNewsletter).toHaveBeenCalledWith("customer@example.com", "footer");
  });

  it("returns only database-backed wishlist and referral results", async () => {
    repository.createWishlistShare.mockResolvedValue("12345678-1234-1234-1234-123456789abc");
    await expect(platformService.createWishlistShare(4, { title: "Gift ideas" })).resolves.toEqual({
      share_token: "12345678-1234-1234-1234-123456789abc",
      share_url: "/wishlist/shared/12345678-1234-1234-1234-123456789abc",
    });

    repository.applyReferralCode.mockResolvedValue(null);
    await expect(platformService.applyReferral("missing-code", 4)).rejects.toMatchObject({ statusCode: 404 });
  });
});
