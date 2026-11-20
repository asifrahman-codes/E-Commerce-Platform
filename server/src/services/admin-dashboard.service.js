import {
    getDashboardOverview,
    getSalesAnalytics,
    getOrderStatusAnalytics,
    getTopSellingProducts,
    getRecentOrders,
    getCustomerAnalytics
} from "../repositories/admin-dashboard.repository.js";


export const getDashboardOverviewService = async () => {

    const data = await getDashboardOverview();

    return {

        total_orders: Number(data.total_orders || 0),

        today_orders: Number(data.today_orders || 0),

        pending_orders: Number(data.pending_orders || 0),

        delivered_orders: Number(data.delivered_orders || 0),

        total_revenue: Number(data.total_revenue || 0),

        today_revenue: Number(data.today_revenue || 0),

        monthly_revenue: Number(data.monthly_revenue || 0),

        total_customers: Number(data.total_customers || 0),

        today_customers: Number(data.today_customers || 0),

        total_products: Number(data.total_products || 0),

        active_products: Number(data.active_products || 0),

        low_stock_variants: Number(data.low_stock_variants || 0)

    };

};


export const getSalesAnalyticsService = async (days = 7) => {

    const safeDays = Math.min(
        365,
        Math.max(1, Number(days) || 7)
    );

    return await getSalesAnalytics(safeDays);

};


export const getOrderStatusAnalyticsService = async () => {

    return await getOrderStatusAnalytics();

};


export const getTopSellingProductsService = async (limit = 5) => {

    const safeLimit = Math.min(
        20,
        Math.max(1, Number(limit) || 5)
    );

    return await getTopSellingProducts(safeLimit);

};


export const getRecentOrdersService = async (limit = 10) => {

    const safeLimit = Math.min(
        50,
        Math.max(1, Number(limit) || 10)
    );

    return await getRecentOrders(safeLimit);

};


export const getCustomerAnalyticsService = async () => {

    const data = await getCustomerAnalytics();

    return {

        total_customers: Number(data.total_customers || 0),

        new_customers: Number(data.new_customers || 0),

        customers_with_orders: Number(data.customers_with_orders || 0)

    };

};