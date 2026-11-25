import api from "./api";

import API_ENDPOINTS from "./endpoints";
import { clearCachedRequests } from "./request-cache";

const getData = (response) => {
    return response?.data?.data ?? response?.data ?? response;
};

const adminProductService = {

    getProducts: async (params = {}) => {
        const response = await api.get(
            API_ENDPOINTS.ADMIN_PRODUCTS.BASE,
            { params }
        );

        return getData(response);
    },

    getProductById: async (id) => {
        const response = await api.get(
            API_ENDPOINTS.ADMIN_PRODUCTS.DETAILS(id)
        );

        return getData(response);
    },

    createProduct: async (data) => {
        const response = await api.post(
            API_ENDPOINTS.ADMIN_PRODUCTS.BASE,
            data
        );

        return getData(response);
    },

    updateProduct: async (id, data) => {
        const response = await api.patch(
            API_ENDPOINTS.ADMIN_PRODUCTS.DETAILS(id),
            data
        );

        return getData(response);
    },

    updateProductStatus: async (id, status) => {
        const response = await api.patch(
            API_ENDPOINTS.ADMIN_PRODUCTS.STATUS(id),
            { status }
        );

        return getData(response);
    },

    uploadProductImages: async (id, files, onUploadProgress) => {
        const formData = new FormData();

        files.forEach((file) => formData.append("images", file));

        const response = await api.post(
            API_ENDPOINTS.ADMIN_PRODUCTS.IMAGES(id),
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                onUploadProgress
            }
        );

        clearCachedRequests("products:");
        return getData(response);
    },

    replaceProductImage: async (imageId, file, onUploadProgress) => {
        const formData = new FormData();
        formData.append("image", file);
        const response = await api.put(
            API_ENDPOINTS.ADMIN_PRODUCTS.IMAGE(imageId),
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress
            }
        );
        clearCachedRequests("products:");
        return getData(response);
    },

    // The existing backend identifies the image by imageId alone.
    setPrimaryImage: async (productId, imageId) => {
        const response = await api.patch(
            API_ENDPOINTS.ADMIN_PRODUCTS.IMAGE_PRIMARY(imageId)
        );

        clearCachedRequests("products:");
        return getData(response);
    },

    deleteProductImage: async (productId, imageId) => {
        const response = await api.delete(
            API_ENDPOINTS.ADMIN_PRODUCTS.IMAGE(imageId)
        );

        clearCachedRequests("products:");
        return getData(response);
    },

};

export default adminProductService;