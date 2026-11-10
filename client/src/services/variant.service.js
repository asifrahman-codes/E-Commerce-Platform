import api from "./api";

const variantService = {
  // Get all variants belonging to a product
  async getProductVariants(productId) {
    const response = await api.get(
      `/products/${productId}/variants`
    );

    const body = response?.data ?? response;
    const data = body?.data ?? body;

    return Array.isArray(data) ? data : [];
  },

  // Get a single variant
  async getVariantById(variantId) {
    const response = await api.get(
      `/variants/${variantId}`
    );

    const body = response?.data ?? response;

    return body?.data ?? body;
  },

  // Create a new variant
  async createVariant(productId, variantData) {
    const response = await api.post(
      `/products/${productId}/variants`,
      variantData
    );

    const body = response?.data ?? response;

    return body?.data ?? body;
  },

  // Update an existing variant
  async updateVariant(variantId, variantData) {
    const response = await api.patch(
      `/variants/${variantId}`,
      variantData
    );

    const body = response?.data ?? response;

    return body?.data ?? body;
  },

  // Delete a variant
  async deleteVariant(variantId) {
    const response = await api.delete(
      `/variants/${variantId}`
    );

    const body = response?.data ?? response;

    return body?.data ?? body;
  },
};

export default variantService;