import api from "./api";
import ENDPOINTS from "./endpoints";

const unwrap = (response) => {
    const body = response?.data ?? response;
    return body?.data ?? body;
};

const variantService = {
    // Get active variants for customers
    async getProductVariants(productId) {
        const response = await api.get(
            ENDPOINTS.PRODUCTS.VARIANTS(productId)
        );

        const data = unwrap(response);

        return Array.isArray(data) ? data : [];
    },

    // Get all variants for Admin
    async getAdminProductVariants(productId) {
        const response = await api.get(
            ENDPOINTS.VARIANTS.ADMIN_PRODUCT_VARIANTS(productId)
        );

        const data = unwrap(response);

        return Array.isArray(data) ? data : [];
    },

    // Get one variant
    async getVariantById(variantId) {
        const response = await api.get(
            ENDPOINTS.VARIANTS.DETAILS(variantId)
        );

        return unwrap(response);
    },

    // Create variant
    async createVariant(productId, variantData) {
        const response = await api.post(
            ENDPOINTS.PRODUCTS.VARIANTS(productId),
            variantData
        );

        return unwrap(response);
    },

    // Update variant
    async updateVariant(variantId, variantData) {
        const response = await api.patch(
            ENDPOINTS.VARIANTS.UPDATE(variantId),
            variantData
        );

        return unwrap(response);
    },

    // Delete variant
    async deleteVariant(variantId) {
        const response = await api.delete(
            ENDPOINTS.VARIANTS.DELETE(variantId)
        );

        return unwrap(response);
    },
};

export default variantService;