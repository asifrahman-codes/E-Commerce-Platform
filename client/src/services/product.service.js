import api from "./api";
import ENDPOINTS from "./endpoints";

import {
  normalizeProduct,
  normalizeProductList,
  normalizeImages,
  unwrapResponse,
} from "../utils/product.utils";

const productService = {
  async getProducts(params = {}) {
    const response = await api.get(ENDPOINTS.PRODUCTS.SEARCH, {
      params,
    });

    const data = unwrapResponse(response);

    return {
      products: normalizeProductList(data),
      pagination: {
        page: Number(data?.pagination?.page ?? data?.page ?? params.page ?? 1),
        limit: Number(
          data?.pagination?.limit ??
          data?.limit ??
          params.limit ??
          12
        ),
        total: Number(
          data?.pagination?.total ??
          data?.total ??
          data?.totalItems ??
          0
        ),
        totalPages: Number(
          data?.pagination?.totalPages ??
          data?.totalPages ??
          1
        ),
      },
      raw: data,
    };
  },

  async getAllProducts(params = {}) {
    const response = await api.get(ENDPOINTS.PRODUCTS.BASE, {
      params,
    });

    return normalizeProductList(response);
  },

  async getProductById(id) {
    const response = await api.get(
      ENDPOINTS.PRODUCTS.DETAILS(id)
    );

    return normalizeProduct(response);
  },

  async getProductImages(id) {
    const response = await api.get(
      ENDPOINTS.PRODUCTS.IMAGES(id)
    );

    return normalizeImages(response);
  },
};

export default productService;