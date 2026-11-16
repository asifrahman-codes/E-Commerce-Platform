import { describe, it, expect, vi, beforeEach } from "vitest";

const m = vi.hoisted(() => ({
  createOrder: vi.fn(async () => 77),
  createOrderItem: vi.fn(),
  findOrderWithItems: vi.fn(),
  findOrdersByUser: vi.fn(),
  findOrderByIdForUpdate: vi.fn(),
  updateOrderStatus: vi.fn(),
  findCartByUserId: vi.fn(async () => ({ cart_id: 5 })),
  getCartWithItems: vi.fn(),
  clearCartWithTransaction: vi.fn(),
  lockCartForUpdate: vi.fn(),
  getVariantForUpdate: vi.fn(),
  updateVariantStockWithTransaction: vi.fn(),
  createInventoryTransactionWithTransaction: vi.fn(),
  restoreVariantStockWithTransaction: vi.fn(),
  findAddressByUserId: vi.fn(),
  getPricingSettingsForUpdate: vi.fn(async () => ({ currency: "PKR", shipping_fee: "250", free_shipping_threshold: "5000", tax_rate: "10", tax_enabled: 1 })),
  validateCouponForOrder: vi.fn(),
  createCouponUsage: vi.fn(),
  releaseCouponUsage: vi.fn(),
}));

vi.mock("../repositories/order.repository.js", () => ({ createOrder: m.createOrder, createOrderItem: m.createOrderItem, findOrderWithItems: m.findOrderWithItems, findOrdersByUser: m.findOrdersByUser, findOrderByIdForUpdate: m.findOrderByIdForUpdate, updateOrderStatus: m.updateOrderStatus }));
vi.mock("../repositories/cart.repository.js", () => ({ findCartByUserId: m.findCartByUserId, getCartWithItems: m.getCartWithItems, clearCartWithTransaction: m.clearCartWithTransaction, lockCartForUpdate: m.lockCartForUpdate }));
vi.mock("../repositories/payment.repository.js", () => ({ findPaymentByOrderIdForOwner: vi.fn(async () => null) }));
vi.mock("../repositories/inventory.repository.js", () => ({ getVariantForUpdate: m.getVariantForUpdate, updateVariantStockWithTransaction: m.updateVariantStockWithTransaction, createInventoryTransactionWithTransaction: m.createInventoryTransactionWithTransaction, restoreVariantStockWithTransaction: m.restoreVariantStockWithTransaction }));
vi.mock("../repositories/address.repository.js", () => ({ findAddressByUserId: m.findAddressByUserId }));
vi.mock("../repositories/pricing.repository.js", () => ({ getPricingSettingsForUpdate: m.getPricingSettingsForUpdate, getActivePricingSettings: m.getPricingSettingsForUpdate }));
vi.mock("../services/coupon.service.js", () => ({ validateCouponForOrder: m.validateCouponForOrder, validateCouponService: vi.fn() }));
vi.mock("../repositories/coupon.repository.js", () => ({ createCouponUsage: m.createCouponUsage, releaseCouponUsage: m.releaseCouponUsage }));
vi.mock("../services/notification.service.js", () => ({ notifyOrderCancelled: vi.fn() }));
vi.mock("../utils/transaction.js", () => ({ default: async (cb) => cb({ tag: "conn" }) }));

import { createOrderService, cancelOrderService } from "../services/order.service.js";

const cartRow = { cart_item_id: 1, variant_id: 9, product_name: "Tee", sku: "T-1", product_price: "1000.00", price_adjustment: "0", quantity: 2 };

beforeEach(() => {
  vi.clearAllMocks();
  m.findAddressByUserId.mockResolvedValue({ address_id: 3 });
  m.getCartWithItems.mockResolvedValue([cartRow]);
  m.getVariantForUpdate.mockResolvedValue({ variant_id: 9, stock: 10, status: "ACTIVE" });
  m.findOrderWithItems.mockResolvedValue({ order_id: 77 });
  m.createOrder.mockResolvedValue(77);
});

describe("createOrderService", () => {
  it("computes subtotal, shipping, tax and total on the backend", async () => {
    await createOrderService(1, { address_id: 3, total: 1, shipping: 0 });
    const arg = m.createOrder.mock.calls[0][1];
    expect(arg).toMatchObject({ subtotal: 2000, discount: 0, shipping: 250, tax: 200, total: 2450, coupon_id: null });
    expect(m.updateVariantStockWithTransaction).toHaveBeenCalledWith(expect.anything(), 9, 8);
    expect(m.clearCartWithTransaction).toHaveBeenCalled();
  });
  it("applies a validated coupon and records usage", async () => {
    m.validateCouponForOrder.mockResolvedValue({ coupon: { coupon_id: 4 }, discount: 200 });
    await createOrderService(1, { address_id: 3, coupon_code: "SAVE" });
    expect(m.createOrder.mock.calls[0][1]).toMatchObject({ coupon_id: 4, discount: 200, total: 2230 });
    expect(m.createCouponUsage).toHaveBeenCalledWith(expect.anything(), { couponId: 4, userId: 1, orderId: 77, discountAmount: 200 });
  });
  it("locks the cart before reading its items (duplicate-submit guard)", async () => {
    await createOrderService(1, { address_id: 3 });
    expect(m.lockCartForUpdate).toHaveBeenCalledWith(expect.anything(), 5);
    expect(m.lockCartForUpdate.mock.invocationCallOrder[0]).toBeLessThan(m.createOrder.mock.invocationCallOrder[0]);
  });
  it("rejects insufficient stock without creating an order", async () => {
    m.getVariantForUpdate.mockResolvedValue({ variant_id: 9, stock: 1, status: "ACTIVE" });
    await expect(createOrderService(1, { address_id: 3 })).rejects.toMatchObject({ statusCode: 400 });
    expect(m.createOrder).not.toHaveBeenCalled();
  });
  it("rejects an address the user does not own", async () => {
    m.findAddressByUserId.mockResolvedValue(null);
    await expect(createOrderService(1, { address_id: 99 })).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("cancelOrderService", () => {
  const order = { order_id: 77, user_id: 1, status: "PENDING", items: [{ variant_id: 9, quantity: 2 }] };
  it("restores stock, releases coupon, cancels under a row lock", async () => {
    m.findOrderWithItems.mockResolvedValue(order);
    m.findOrderByIdForUpdate.mockResolvedValue({ status: "PENDING" });
    m.getVariantForUpdate.mockResolvedValue({ variant_id: 9 });
    await cancelOrderService(77, 1);
    expect(m.restoreVariantStockWithTransaction).toHaveBeenCalledWith(expect.anything(), 9, 2);
    expect(m.releaseCouponUsage).toHaveBeenCalledWith(expect.anything(), 77);
    expect(m.updateOrderStatus).toHaveBeenCalledWith(expect.anything(), 77, "CANCELLED");
  });
  it("409 when the status changed after the first read (race)", async () => {
    m.findOrderWithItems.mockResolvedValue(order);
    m.findOrderByIdForUpdate.mockResolvedValue({ status: "SHIPPED" });
    await expect(cancelOrderService(77, 1)).rejects.toMatchObject({ statusCode: 409 });
    expect(m.restoreVariantStockWithTransaction).not.toHaveBeenCalled();
  });
  it("403 for another user's order", async () => {
    m.findOrderWithItems.mockResolvedValue({ ...order, user_id: 2 });
    await expect(cancelOrderService(77, 1)).rejects.toMatchObject({ statusCode: 403 });
  });
});
