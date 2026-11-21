import api from "./api";
import ENDPOINTS from "./endpoints";
import { unwrapResponse } from "../utils/product.utils";
import { getCachedRequest } from "./request-cache";

const brandService = {
  async getBrands() {
    return getCachedRequest("catalog:brands", async () => {
      const response = await api.get(ENDPOINTS.BRANDS.BASE);
      const data = unwrapResponse(response);

      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.brands)) return data.brands;
      if (Array.isArray(data?.items)) return data.items;

      return [];
    }, 30_000);
  },
};

export default brandService;
