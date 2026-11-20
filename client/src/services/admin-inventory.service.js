import api from "./api";

import API_ENDPOINTS from "./endpoints";

const getData = (response) => {
    return response?.data?.data ?? response?.data ?? response;
};

const adminInventoryService = {

    getDashboard: async () => {
        const response = await api.get(
            API_ENDPOINTS.ADMIN_INVENTORY.DASHBOARD
        );

        return getData(response);
    },

    getLowStock: async (threshold = 5) => {
        const response = await api.get(
            API_ENDPOINTS.ADMIN_INVENTORY.LOW_STOCK,
            {
                params: { threshold }
            }
        );

        return getData(response);
    },

    getHistory: async (params = {}) => {
        const response = await api.get(
            API_ENDPOINTS.ADMIN_INVENTORY.HISTORY,
            { params }
        );

        return getData(response);
    },

    adjustStock: async (data) => {
        const response = await api.post(
            API_ENDPOINTS.ADMIN_INVENTORY.ADJUST,
            data
        );

        return getData(response);
    },

};

export default adminInventoryService;