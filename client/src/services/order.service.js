import api from "./api";
import API_ENDPOINTS from "./endpoints";

const payload = (response) => response?.data ?? response;

// Priced entirely by the backend from the server-side cart.
export const previewOrder = async (couponCode = "") =>
  payload(
    await api.post(API_ENDPOINTS.ORDERS.PREVIEW, {
      coupon_code: couponCode,
    })
  );

// Only the address and coupon are sent; the backend computes every amount.
export const placeOrder = async ({ addressId, couponCode = "" }) =>
  payload(
    await api.post(API_ENDPOINTS.ORDERS.BASE, {
      address_id: addressId,
      coupon_code: couponCode,
    })
  );

export const getOrder = async (id) =>
  payload(await api.get(API_ENDPOINTS.ORDERS.DETAILS(id)));
