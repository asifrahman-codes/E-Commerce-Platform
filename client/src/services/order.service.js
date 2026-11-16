import api from "./api";
import API_ENDPOINTS from "./endpoints";

const payload = (response) => response?.data ?? response;

// Existing checkout functions
export const previewOrder = async (couponCode = "") =>
  payload(
    await api.post(API_ENDPOINTS.ORDERS.PREVIEW, {
      coupon_code: couponCode,
    })
  );

export const placeOrder = async ({
  addressId,
  couponCode = "",
}) =>
  payload(
    await api.post(API_ENDPOINTS.ORDERS.BASE, {
      address_id: addressId,
      coupon_code: couponCode,
    })
  );

// Get customer order history
export const getUserOrders = async () =>
  payload(
    await api.get(API_ENDPOINTS.ORDERS.BASE)
  );

// Get one order with its items, address and payment
export const getOrder = async (id) =>
  payload(
    await api.get(API_ENDPOINTS.ORDERS.DETAILS(id))
  );

// Cancel an order
export const cancelOrder = async (id) =>
  payload(
    await api.patch(API_ENDPOINTS.ORDERS.CANCEL(id), {})
  );
