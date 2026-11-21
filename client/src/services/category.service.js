
import api from "./api";
import ENDPOINTS from "./endpoints";

import { unwrapResponse } from "../utils/product.utils";
import { getCachedRequest } from "./request-cache";

const categoryService = {
  // Get all categories
  async getCategories() {
    return getCachedRequest("catalog:categories", async () => {
      const response = await api.get(ENDPOINTS.CATEGORIES.BASE);
      const data = unwrapResponse(response);

      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.categories)) return data.categories;
      if (Array.isArray(data?.items)) return data.items;

      return [];
    }, 30_000);
  },

  // Get category by ID
  async getCategoryById(id) {
    const response = await api.get(
      ENDPOINTS.CATEGORIES.DETAILS(id)
    );

    const data = unwrapResponse(response);

    return data?.category ?? data;
  },
};

export default categoryService;
