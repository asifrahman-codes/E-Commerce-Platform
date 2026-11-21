
import api from "./api";
import ENDPOINTS from "./endpoints";
import { getCachedRequest, serializeRequestParams } from "./request-cache";

const productService = {
  // Search, filter, sort and paginate products
  async getProducts(params = {}) {
    const key = `products:search:${serializeRequestParams(params)}`;
    return getCachedRequest(key, async () => {
      const response = await api.get(ENDPOINTS.PRODUCTS.SEARCH, {
        params,
      });

      const body = response?.data ?? response;
      const data = body?.data ?? body;

      return {
        products: Array.isArray(data?.products)
          ? data.products
          : [],

        filters: data?.filters ?? {},

        pagination: {
          page: Number(data?.pagination?.page ?? params.page ?? 1),
          limit: Number(data?.pagination?.limit ?? params.limit ?? 12),
          total: Number(data?.pagination?.total_items ?? 0),
          totalPages: Number(data?.pagination?.total_pages ?? 0),

          hasNextPage: Boolean(data?.pagination?.has_next_page),
          hasPreviousPage: Boolean(data?.pagination?.has_previous_page),
        },
      };
    }, 2_000);
  },

  async getProductsForComparison(productIds) {
    const ids = productIds.join(",");
    return getCachedRequest(`products:compare:${ids}`, async () => {
      const response = await api.get(ENDPOINTS.PRODUCTS.COMPARE, {
        params: { ids },
      });

      const body = response?.data ?? response;
      const data = body?.data ?? body;
      return Array.isArray(data?.products) ? data.products : [];
    });
  },

  // Get individual product
  async getProductById(id) {
    return getCachedRequest(`products:detail:${id}`, async () => {
      const response = await api.get(
        ENDPOINTS.PRODUCTS.DETAILS(id)
      );

      const body = response?.data ?? response;

      return body?.data ?? body;
    });
  },

  // Get product images
  async getProductImages(id) {
    return getCachedRequest(`products:images:${id}`, async () => {
      const response = await api.get(
        ENDPOINTS.PRODUCTS.IMAGES(id)
      );

      const body = response?.data ?? response;
      const data = body?.data ?? body;

      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.images)) return data.images;

      return [];
    });
  },

  // Get product variants
  async getProductVariants(productId) {
    return getCachedRequest(`products:variants:${productId}`, async () => {
      const response = await api.get(
        `/products/${productId}/variants`
      );

      const body = response?.data ?? response;
      const data = body?.data ?? body;

      return Array.isArray(data) ? data : [];
    });
  },

};

export default productService;
