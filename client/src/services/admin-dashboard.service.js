import api from "./api";

import API_ENDPOINTS from "./endpoints";


const getData = (response) => {

    const body = response.data;

    return body?.data ?? body;

};


const adminDashboardService = {

    getOverview: async () => {

        const response = await api.get(
            API_ENDPOINTS.ADMIN_DASHBOARD.OVERVIEW
        );

        return getData(response);

    },


    getSales: async (days = 7) => {

        const response = await api.get(
            API_ENDPOINTS.ADMIN_DASHBOARD.SALES,
            {
                params: { days }
            }
        );

        return getData(response);

    },


    getOrders: async () => {

        const response = await api.get(
            API_ENDPOINTS.ADMIN_DASHBOARD.ORDERS
        );

        return getData(response);

    },


    getTopProducts: async (limit = 5) => {

        const response = await api.get(
            API_ENDPOINTS.ADMIN_DASHBOARD.TOP_PRODUCTS,
            {
                params: { limit }
            }
        );

        return getData(response);

    },


    getRecentOrders: async (limit = 10) => {

        const response = await api.get(
            API_ENDPOINTS.ADMIN_DASHBOARD.RECENT_ORDERS,
            {
                params: { limit }
            }
        );

        return getData(response);

    },


    getCustomers: async () => {

        const response = await api.get(
            API_ENDPOINTS.ADMIN_DASHBOARD.CUSTOMERS
        );

        return getData(response);

    }

};


export default adminDashboardService;