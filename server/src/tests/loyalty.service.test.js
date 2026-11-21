import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  adjustLoyaltyBalance: vi.fn(),
  countLoyaltyTransactions: vi.fn(),
  createLoyaltyTransaction: vi.fn(),
  createPointLot: vi.fn(),
  createRedemptionAllocation: vi.fn(),
  createRedemptionRestoreLot: vi.fn(),
  ensureLoyaltyAccount: vi.fn(),
  expirePointLot: vi.fn(),
  findEarnedPointLotForOrder: vi.fn(),
  findExpiredPointLots: vi.fn(),
  findOrderForLoyaltyAward: vi.fn(),
  findLoyaltyTransactionByEvent: vi.fn(),
  findRedeemablePointLots: vi.fn(),
  findRedemptionAllocations: vi.fn(),
  findRedemptionForOrder: vi.fn(),
  getLoyaltySettings: vi.fn(),
  listLoyaltyTransactions: vi.fn(),
  reducePointLot: vi.fn(),
  restorePointLot: vi.fn(),
  updateLoyaltySettings: vi.fn(),
  updatePointLotRemaining: vi.fn(),
}));

vi.mock("../repositories/loyalty.repository.js", () => m);
vi.mock("../utils/transaction.js", () => ({
  default: async (callback) => callback({ execute: vi.fn() }),
}));

import {
  awardCompletedOrderPoints,
  quoteLoyaltyRedemption,
} from "../services/loyalty.service.js";

const settings = {
  points_per_currency: "0.0100",
  currency_per_point: "0.0100",
  minimum_redemption_points: 100,
  expiry_days: null,
  status: "ACTIVE",
};

beforeEach(() => {
  vi.clearAllMocks();
  m.ensureLoyaltyAccount.mockResolvedValue({
    user_id: 5,
    balance: 500,
    lifetime_earned: 500,
  });
  m.findExpiredPointLots.mockResolvedValue([]);
  m.getLoyaltySettings.mockResolvedValue(settings);
  m.findLoyaltyTransactionByEvent.mockResolvedValue(null);
  m.createLoyaltyTransaction.mockResolvedValue(24);
});

describe("loyalty checkout and awards", () => {
  it("converts 100 points to the configured PKR 1 checkout discount", async () => {
    await expect(quoteLoyaltyRedemption({}, {
      userId: 5,
      points: 100,
      maximumDiscount: 50,
    })).resolves.toEqual({ points: 100, discount: 1 });
  });

  it("rejects redemptions above the current balance", async () => {
    await expect(quoteLoyaltyRedemption({}, {
      userId: 5,
      points: 501,
      maximumDiscount: 50,
    })).rejects.toMatchObject({ statusCode: 400 });
  });

  it("awards points only once after paid delivery and on post-discount merchandise", async () => {
    const connection = {};
    m.findOrderForLoyaltyAward.mockResolvedValue({
      order_id: 80,
      user_id: 5,
      subtotal: "10000.00",
      discount: "100.00",
      status: "DELIVERED",
      payment_status: "PAID",
    });

    await expect(awardCompletedOrderPoints(connection, 80)).resolves.toBe(99);
    expect(m.findOrderForLoyaltyAward).toHaveBeenCalledWith(connection, 80);
    expect(m.createLoyaltyTransaction).toHaveBeenCalledWith(
      connection,
      expect.objectContaining({
        type: "EARN",
        pointsChange: 99,
        eventKey: "order:80:loyalty-earn",
      })
    );
    expect(m.adjustLoyaltyBalance).toHaveBeenCalledWith(connection, 5, 99, true);

    m.findLoyaltyTransactionByEvent.mockResolvedValue({ transaction_id: 24 });
    await expect(awardCompletedOrderPoints(connection, 80)).resolves.toBe(0);
    expect(m.createLoyaltyTransaction).toHaveBeenCalledTimes(1);
  });

  it("does not award points before the order is delivered and paid", async () => {
    const connection = {};
    m.findOrderForLoyaltyAward.mockResolvedValue({
      order_id: 81,
      user_id: 5,
      subtotal: "10000.00",
      discount: "0.00",
      status: "SHIPPED",
      payment_status: "PAID",
    });

    await expect(awardCompletedOrderPoints(connection, 81)).resolves.toBe(0);
    expect(m.createLoyaltyTransaction).not.toHaveBeenCalled();
  });
});
