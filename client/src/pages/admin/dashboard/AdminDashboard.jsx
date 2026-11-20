import { useCallback, useEffect, useState } from "react";

import {
    Wallet,
    ShoppingBag,
    Users,
    Package,
    RefreshCw,
    Truck,
    AlertTriangle
} from "lucide-react";

import adminDashboardService from "../../../services/admin-dashboard.service";

import StatCard from "./components/StatCard";

import RevenueChart from "./components/RevenueChart";

import OrderStatusChart from "./components/OrderStatusChart";

import TopSellingProducts from "./components/TopSellingProducts";

import RecentOrders from "./components/RecentOrders";

import LoadingSpinner from "../../../components/common/LoadingSpinner";


export default function AdminDashboard() {

    const [overview, setOverview] = useState(null);

    const [sales, setSales] = useState([]);

    const [orders, setOrders] = useState([]);

    const [products, setProducts] = useState([]);

    const [recentOrders, setRecentOrders] = useState([]);

    const [customers, setCustomers] = useState(null);

    const [days, setDays] = useState(7);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");


    const loadDashboard = useCallback(async (isRefresh = false) => {

        try {

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const [
                overviewData,
                salesData,
                orderData,
                productData,
                recentOrderData,
                customerData
            ] = await Promise.all([

                adminDashboardService.getOverview(),

                adminDashboardService.getSales(days),

                adminDashboardService.getOrders(),

                adminDashboardService.getTopProducts(5),

                adminDashboardService.getRecentOrders(10),

                adminDashboardService.getCustomers()

            ]);


            setOverview(overviewData);

            setSales(Array.isArray(salesData) ? salesData : []);

            setOrders(Array.isArray(orderData) ? orderData : []);

            setProducts(Array.isArray(productData) ? productData : []);

            setRecentOrders(
                Array.isArray(recentOrderData) ? recentOrderData : []
            );

            setCustomers(customerData);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load dashboard."
            );

        } finally {

            setLoading(false);

            setRefreshing(false);

        }

    }, [days]);


    useEffect(() => {

        loadDashboard();

    }, [loadDashboard]);


    if (loading) {

        return (

            <div className="flex min-h-[60vh] items-center justify-center">

                <LoadingSpinner />

            </div>

        );

    }


    if (error && !overview) {

        return (

            <div className="rounded-xl border border-red-200 bg-red-50 p-5">

                <p className="text-sm text-red-700">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={() => loadDashboard()}
                    className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                >
                    Retry
                </button>

            </div>

        );

    }


    const cards = [

        {
            title: "Total Revenue",
            value: overview?.total_revenue,
            icon: Wallet,
            currency: true,
            color: "green",
            description: "Successfully paid orders"
        },

        {
            title: "Today's Revenue",
            value: overview?.today_revenue,
            icon: TrendingUpIcon,
            currency: true,
            color: "indigo",
            description: "Collected today"
        },

        {
            title: "Total Orders",
            value: overview?.total_orders,
            icon: ShoppingBag,
            color: "indigo",
            description: `${overview?.today_orders || 0} orders today`
        },

        {
            title: "Pending Orders",
            value: overview?.pending_orders,
            icon: Truck,
            color: "amber",
            description: "Require attention"
        },

        {
            title: "Total Customers",
            value: overview?.total_customers,
            icon: Users,
            color: "indigo",
            description: `${overview?.today_customers || 0} registered today`
        },

        {
            title: "Active Products",
            value: overview?.active_products,
            icon: Package,
            color: "green",
            description: `${overview?.total_products || 0} total products`
        },

        {
            title: "Low Stock Variants",
            value: overview?.low_stock_variants,
            icon: AlertTriangle,
            color: "red",
            description: "Five or fewer units"
        },

        {
            title: "Delivered Orders",
            value: overview?.delivered_orders,
            icon: Truck,
            color: "green",
            description: "Successfully delivered"
        }

    ];


    return (

        <div className="space-y-7">

            {/* Header */}

            <div className="flex flex-wrap items-center justify-between gap-4">

                <div>

                    <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
                        Dashboard
                    </h1>

                    <p className="mt-2 text-sm text-zinc-500">
                        Monitor your ShopSphere business performance.
                    </p>

                </div>


                <button
                    type="button"
                    onClick={() => loadDashboard(true)}
                    disabled={refreshing}
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                >

                    <RefreshCw
                        size={17}
                        className={refreshing ? "animate-spin" : ""}
                    />

                    Refresh

                </button>

            </div>


            {error && (
                <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                    Some dashboard information could not be refreshed: {error}
                </p>
            )}


            {/* Statistics */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {cards.map(card => (

                    <StatCard
                        key={card.title}
                        {...card}
                    />

                ))}

            </div>


            {/* Revenue and Orders */}

            <section className="grid gap-6 xl:grid-cols-3">

                <div className="xl:col-span-2">

                    <div className="mb-4 flex items-center justify-between gap-3">

                        <h2 className="font-semibold text-zinc-900">
                            Sales Performance
                        </h2>

                        <select
                            value={days}
                            onChange={(e) => setDays(Number(e.target.value))}
                            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
                        >

                            <option value={7}>Last 7 days</option>

                            <option value={30}>Last 30 days</option>

                            <option value={90}>Last 90 days</option>

                            <option value={365}>Last 365 days</option>

                        </select>

                    </div>

                    <RevenueChart data={sales} />

                </div>


                <OrderStatusChart data={orders} />

            </section>


            {/* Top products and customers */}

            <section className="grid gap-6 lg:grid-cols-2">

                <TopSellingProducts products={products} />


                <div className="rounded-2xl border border-zinc-200 bg-white p-5">

                    <h2 className="font-bold text-zinc-900">
                        Customer Overview
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                        Customer registration and purchasing activity.
                    </p>


                    <div className="mt-6 grid grid-cols-2 gap-4">

                        <div className="rounded-xl bg-zinc-50 p-4">

                            <p className="text-sm text-zinc-500">
                                Total Customers
                            </p>

                            <p className="mt-2 text-2xl font-bold">
                                {customers?.total_customers || 0}
                            </p>

                        </div>


                        <div className="rounded-xl bg-zinc-50 p-4">

                            <p className="text-sm text-zinc-500">
                                New Customers
                            </p>

                            <p className="mt-2 text-2xl font-bold">
                                {customers?.new_customers || 0}
                            </p>

                        </div>


                        <div className="col-span-2 rounded-xl bg-indigo-50 p-4">

                            <p className="text-sm text-indigo-700">
                                Customers with Orders
                            </p>

                            <p className="mt-2 text-2xl font-bold text-indigo-900">
                                {customers?.customers_with_orders || 0}
                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {/* Recent orders */}

            <RecentOrders orders={recentOrders} />

        </div>

    );

}


function TrendingUpIcon(props) {

    return <Wallet {...props} />;

}