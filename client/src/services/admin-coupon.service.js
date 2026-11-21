import api from "./api";
import API_ENDPOINTS from "./endpoints";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

const adminCouponService = {
  getCoupons: async () => unwrap(await api.get(API_ENDPOINTS.COUPONS.BASE)),
  createCoupon: async (data) => unwrap(await api.post(API_ENDPOINTS.COUPONS.BASE, data)),
  updateCoupon: async (id, data) => unwrap(await api.patch(API_ENDPOINTS.COUPONS.DETAILS(id), data)),
  deactivateCoupon: async (id) => unwrap(await api.patch(API_ENDPOINTS.COUPONS.DEACTIVATE(id))),
};

export default adminCouponService;
