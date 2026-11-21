import api from "./api";
import API_ENDPOINTS from "./endpoints";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

const adminShippingService = {
  getMethods: async () => {
    const data = unwrap(await api.get(API_ENDPOINTS.SHIPPING.ADMIN_METHODS));
    if (Array.isArray(data)) return data;
    return data?.methods ?? data?.items ?? [];
  },
  createMethod: async (data) => unwrap(await api.post(API_ENDPOINTS.SHIPPING.ADMIN_METHODS, data)),
  updateMethod: async (id, data) => unwrap(await api.patch(`${API_ENDPOINTS.SHIPPING.ADMIN_METHODS}/${id}`, data)),
};

export default adminShippingService;
