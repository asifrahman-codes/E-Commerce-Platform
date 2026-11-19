import {
    getDashboardStatistics,
    getRecentOrders,
    getMonthlyRevenue,
    getOrderStatusStatistics,
    getLowStockVariants
} from "../repositories/admin.repository.js";


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
        lowStockVariants
    ] = await Promise.all([

        getDashboardStatistics(),

        getRecentOrders(5),

        getMonthlyRevenue(),

        getOrderStatusStatistics(),

        getLowStockVariants(5)

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

        }))

    };

};