
import {
    getDashboardOverviewService,
    getSalesAnalyticsService,
    getTopSellingProductsService,
    getOrderStatusAnalyticsService,
    getCustomerAnalyticsService,
} from "./admin-dashboard.service.js";

import {
    getInventoryStatistics,
    getLowStockVariants,
    getFastMovingProducts,
    getSlowMovingProducts,
} from "../repositories/ai-inventory.repository.js";

export async function getAdminBusinessContext() {

    const [
        overview,
        sales,
        topProducts,
        orderStatuses,
        customers,
        inventory,
        lowStock,
        fastMoving,
        slowMoving,
    ] = await Promise.all([

        getDashboardOverviewService(),

        getSalesAnalyticsService(30),

        getTopSellingProductsService(10),

        getOrderStatusAnalyticsService(),

        getCustomerAnalyticsService(),

        getInventoryStatistics(),

        getLowStockVariants(5),

        getFastMovingProducts(30),

        getSlowMovingProducts(30),

    ]);

    return {

        overview,

        sales_analytics: sales,

        top_selling_products: topProducts,

        order_status_distribution: orderStatuses,

        customer_analytics: customers,

        inventory: {

            statistics: inventory,

            low_stock_products: lowStock,

            fast_moving_products: fastMoving,

            slow_moving_products: slowMoving,

        },

        generated_at: new Date().toISOString(),

    };

}
