import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";

const h = vi.hoisted(() => ({
  cart: { items: [{ cart_item_id: 1, product_name: "Classic Tee", size: "M", color: "Blue", sku: "T-1", quantity: 2, item_subtotal: 2000, primary_image_url: "" }], subtotal: 2000, total_items: 2 },
  refreshCart: vi.fn(), getAddresses: vi.fn(), previewOrder: vi.fn(), placeOrder: vi.fn(), payWithCod: vi.fn(), startOnlinePayment: vi.fn(),
}));
vi.mock("../context/CartContext", () => ({ useCart: () => ({ cart: h.cart, refreshCart: h.refreshCart }) }));
vi.mock("../services/address.service", () => ({ getAddresses: h.getAddresses, createAddress: vi.fn(), updateAddress: vi.fn(), deleteAddress: vi.fn() }));
vi.mock("../services/order.service", () => ({ previewOrder: h.previewOrder, placeOrder: h.placeOrder, getOrder: vi.fn() }));
vi.mock("../services/payment.service", () => ({ payWithCod: h.payWithCod, startOnlinePayment: h.startOnlinePayment }));

import Checkout from "../pages/checkout/Checkout";

const Where = () => { const l = useLocation(); return <div data-testid="loc">{l.pathname}|{JSON.stringify(l.state)}</div>; };
const ui = () => render(<MemoryRouter initialEntries={["/checkout"]}><Routes><Route path="/checkout" element={<Checkout />} /><Route path="*" element={<Where />} /></Routes></MemoryRouter>);
const PRICE = { subtotal: 2000, discount: 0, shipping: 250, tax: 200, total: 2450, free_shipping_threshold: 5000 };
const addr = { address_id: 3, street: "12 Test Street", city: "Islamabad", postal_code: "44000", country: "Pakistan", is_default: 1 };
const placeBtn = () => screen.getAllByRole("button", { name: /place order/i }).find((b) => !b.disabled) ?? screen.getAllByRole("button", { name: /place order/i })[0];

beforeEach(() => {
  vi.clearAllMocks();
  h.refreshCart.mockResolvedValue(h.cart);
  h.getAddresses.mockResolvedValue([addr]);
  h.previewOrder.mockResolvedValue(PRICE);
  h.placeOrder.mockResolvedValue({ order_id: 77 });
  h.payWithCod.mockResolvedValue({});
  h.startOnlinePayment.mockResolvedValue({ attemptId: 9 });
});

describe("Checkout page", () => {
  it("shows items, the default address and server-calculated totals", async () => {
    ui();
    await screen.findByText("Classic Tee");
    expect(screen.getByText("12 Test Street")).toBeTruthy();
    expect(await screen.findAllByText(/2,450/)).toBeTruthy();
    expect(screen.getByRole("radio", { name: /12 Test Street/ }).checked).toBe(true);
    expect(h.previewOrder).toHaveBeenCalledWith("");
  });
  it("COD: a double click sends exactly one order and one payment request, then opens the confirmation", async () => {
    const user = userEvent.setup(); ui();
    await screen.findAllByText(/2,450/);
    const b = placeBtn(); await user.dblClick(b);
    await waitFor(() => expect(screen.getByTestId("loc").textContent).toContain("/order-confirmation/77"));
    expect(h.placeOrder).toHaveBeenCalledTimes(1);
    expect(h.placeOrder).toHaveBeenCalledWith({ addressId: 3, couponCode: "" });
    expect(h.payWithCod).toHaveBeenCalledTimes(1);
  });
  it("online: starts the mock payment and navigates to it", async () => {
    const user = userEvent.setup(); ui();
    await screen.findAllByText(/2,450/);
    await user.click(screen.getByRole("radio", { name: /pay online/i }));
    await user.click(placeBtn());
    await waitFor(() => expect(screen.getByTestId("loc").textContent).toContain("/mock-payment/9"));
    expect(h.payWithCod).not.toHaveBeenCalled();
  });
  it("payment step failure still lands on the confirmation page with the error", async () => {
    h.payWithCod.mockRejectedValue({ message: "Gateway down" });
    const user = userEvent.setup(); ui();
    await screen.findAllByText(/2,450/); await user.click(placeBtn());
    await waitFor(() => expect(screen.getByTestId("loc").textContent).toContain("Gateway down"));
    expect(screen.getByTestId("loc").textContent).toContain("/order-confirmation/77");
  });
  it("order failure (stock) shows the server message, re-enables the button and refreshes totals", async () => {
    h.placeOrder.mockRejectedValue({ message: "Insufficient stock for Classic Tee" });
    const user = userEvent.setup(); ui();
    await screen.findAllByText(/2,450/); await user.click(placeBtn());
    expect((await screen.findByRole("alert")).textContent).toContain("Insufficient stock");
    await waitFor(() => expect(h.previewOrder).toHaveBeenCalledTimes(2));
    expect(h.payWithCod).not.toHaveBeenCalled();
  });
  it("blocks ordering without an address and offers to add one", async () => {
    h.getAddresses.mockResolvedValue([]);
    ui();
    await screen.findByText(/no saved addresses/i);
    expect(screen.getByRole("button", { name: /add delivery address/i })).toBeTruthy();
    expect(placeBtn().disabled).toBe(true);
  });
  it("applies a coupon via the server preview; an invalid code shows an error and falls back", async () => {
    const user = userEvent.setup(); ui();
    await screen.findAllByText(/2,450/);
    h.previewOrder.mockResolvedValueOnce({ ...PRICE, discount: 200, tax: 180, total: 2230 });
    await user.type(screen.getByLabelText(/coupon code/i), "save10");
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(await screen.findByText(/SAVE10 applied/)).toBeTruthy();
    expect(h.previewOrder).toHaveBeenLastCalledWith("save10");
    await user.click(screen.getByRole("button", { name: /remove coupon/i }));
    h.previewOrder.mockRejectedValueOnce({ message: "Coupon has expired" });
    await user.type(screen.getByLabelText(/coupon code/i), "old");
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(await screen.findByText("Coupon has expired")).toBeTruthy();
  });
});
