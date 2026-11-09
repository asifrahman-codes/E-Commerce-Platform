
import api from "./api";
import ENDPOINTS from "./endpoints";

const productService = {
  // Search, filter, sort and paginate products
  async getProducts(params = {}) {
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

        hasNextPage: Boolean(
          data?.pagination?.has_next_page
        ),

        hasPreviousPage: Boolean(
          data?.pagination?.has_previous_page
        ),
      },
    };
  },

  // Get all products
  async getAllProducts() {
    const response = await api.get(ENDPOINTS.PRODUCTS.BASE);

    const body = response?.data ?? response;
    const data = body?.data ?? body;

    return Array.isArray(data) ? data : [];
  },

  // Get individual product
  async getProductById(id) {
    const response = await api.get(
      ENDPOINTS.PRODUCTS.DETAILS(id)
    );

    const body = response?.data ?? response;

    return body?.data ?? body;
  },

  // Get product images
  async getProductImages(id) {
    const response = await api.get(
      ENDPOINTS.PRODUCTS.IMAGES(id)
    );

    const body = response?.data ?? response;
    const data = body?.data ?? body;

    if (Array.isArray(data)) return data;

    if (Array.isArray(data?.images)) return data.images;

    return [];
  },
};

export default productService;