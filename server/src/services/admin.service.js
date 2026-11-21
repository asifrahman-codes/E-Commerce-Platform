import {
    getDashboardStatistics,
    getRecentOrders,
    getMonthlyRevenue,
    getOrderStatusStatistics,
    getLowStockVariants
} from "../repositories/admin.repository.js";
import {
    getTopSellingProducts,
    getCustomerAnalytics
} from "../repositories/admin-dashboard.repository.js";


/*
|--------------------------------------------------------------------------
| Admin Dashboard Service
|--------------------------------------------------------------------------
*/

export const getAdminDashboardService = async () => {

    const [
        statistics,
        recentOrders,
        monthlyRevenue,
        orderStatuses,
        lowStockVariants,
        topSellingProducts,
        customerAnalytics
    ] = await Promise.all([

        getDashboardStatistics(),

        getRecentOrders(5),

        getMonthlyRevenue(),

        getOrderStatusStatistics(),

        getLowStockVariants(5),

        getTopSellingProducts(5),

        getCustomerAnalytics()

    ]);

    return {

        statistics: {

            total_orders:
                Number(statistics.total_orders),

            total_revenue:
                Number(statistics.total_revenue),

            total_customers:
                Number(statistics.total_customers),

            total_products:
                Number(statistics.total_products),

            pending_orders:
                Number(statistics.pending_orders),

            delivered_orders:
                Number(statistics.delivered_orders),

            cancelled_orders:
                Number(statistics.cancelled_orders)

        },

        recent_orders: recentOrders,

        monthly_revenue: monthlyRevenue.map(item => ({

            month: item.month,

            revenue: Number(item.revenue),

            orders: Number(item.orders)

        })),

        order_statuses: orderStatuses.map(item => ({

            status: item.status,

            total: Number(item.total)

        })),

        low_stock_variants: lowStockVariants.map(item => ({

            ...item,

            stock: Number(item.stock)
        })),

        top_selling_products: topSellingProducts.map(item => ({
            ...item,
            total_sold: Number(item.total_sold || 0),
            total_sales: Number(item.total_sales || 0)
        })),

        customer_analytics: {
            total_customers: Number(customerAnalytics.total_customers || 0),
            new_customers: Number(customerAnalytics.new_customers || 0),
            customers_with_orders: Number(customerAnalytics.customers_with_orders || 0)
        }

    };

};