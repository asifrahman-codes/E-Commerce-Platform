import { describe, expect, it, vi } from "vitest";

const withTransaction = vi.hoisted(() => vi.fn());

vi.mock("../utils/transaction.js", () => ({
  default: withTransaction,
}));

vi.mock("../repositories/admin-order.repository.js", () => ({
  findAllOrders: vi.fn(),
  findAdminOrderById: vi.fn(),
  findOrderForAdminUpdate: vi.fn(),
  findOrderItemsForAdminUpdate: vi.fn(),
  findPaymentForAdminUpdate: vi.fn(),
  updateAdminOrderStatusWithTransaction: vi.fn(),
  updateAdminPaymentStatusWithTransaction: vi.fn(),
  insertOrderStatusHistoryWithTransaction: vi.fn(),
  updatePaymentRecordWithTransaction: vi.fn(),
}));

vi.mock("../repositories/inventory.repository.js", () => ({
  getVariantForUpdate: vi.fn(),
  restoreVariantStockWithTransaction: vi.fn(),
  createInventoryTransactionWithTransaction: vi.fn(),
}));

vi.mock("../repositories/coupon.repository.js", () => ({
  releaseCouponUsage: vi.fn(),
}));

vi.mock("../services/flash-sale.service.js", () => ({
  releaseFlashSaleUsageForOrder: vi.fn(),
}));

vi.mock("../services/loyalty.service.js", () => ({
  awardCompletedOrderPoints: vi.fn(),
  restoreRedeemedPointsForOrder: vi.fn(),
  reverseEarnedPointsForOrder: vi.fn(),
}));

vi.mock("../services/notification.service.js", () => ({
  notifyOrderConfirmed: vi.fn(),
  notifyOrderProcessing: vi.fn(),
  notifyOrderCancelled: vi.fn(),
  notifyOrderRefunded: vi.fn(),
  notifyOrderDelivered: vi.fn(),
  notifyPaymentStatusUpdated: vi.fn(),
}));

import {
  updateAdminOrderStatusService,
  updateAdminPaymentStatusService,
} from "../services/admin-order.service.js";

describe("refund provider confirmation requirement", () => {
  it("does not mark an order refunded without provider confirmation", async () => {
    await expect(
      updateAdminOrderStatusService({
        orderId: 7,
        status: "REFUNDED",
        adminId: 1,
      })
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(withTransaction).not.toHaveBeenCalled();
  });

  it("does not mark a payment refunded without provider confirmation", async () => {
    await expect(
      updateAdminPaymentStatusService({
        orderId: 7,
        paymentStatus: "REFUNDED",
        adminId: 1,
      })
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(withTransaction).not.toHaveBeenCalled();
  });
});
