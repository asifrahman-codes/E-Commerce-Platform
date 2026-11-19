import { useCallback, useEffect, useState } from "react";

import {
    RefreshCw,
    ShoppingBag,
    Package,
    Users
} from "lucide-react";

import { Link } from "react-router-dom";

import { getAdminDashboard } from "../../services/admin.service";

import AdminStatCard from "../../components/admin/AdminStatCard";

import RevenueChart from "../../components/admin/RevenueChart";

import OrderStatusChart from "../../components/admin/OrderStatusChart";

import RecentOrders from "../../components/admin/RecentOrders";

import LowStockProducts from "../../components/admin/LowStockProducts";


const formatPrice = (value) => {

    return new Intl.NumberFormat("en-PK", {

        style: "currency",

        currency: "PKR",

        maximumFractionDigits: 0

    }).format(Number(value || 0));

};


export default function AdminDashboard() {

    const [dashboard, setDashboard] = useState(null);

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

            const data = await getAdminDashboard();

            setDashboard(data);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to load admin dashboard."
            );

        } finally {

            setLoading(false);

            setRefreshing(false);

        }

    }, []);


    useEffect(() => {

        loadDashboard();

    }, [loadDashboard]);


    if (loading) {

        return (

            <div className="flex min-h-[60vh] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600" />

                    <p className="mt-4 text-sm text-zinc-500">
                        Loading admin dashboard...
                    </p>

                </div>

            </div>

        );

    }


    if (error && !dashboard) {

        return (

            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

                <h2 className="font-semibold text-red-700">
                    Dashboard Error
                </h2>

                <p className="mt-2 text-sm text-red-600">
                    {error}
                </p>

                <button
                    onClick={() => loadDashboard()}
                    className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                    Try Again
                </button>

            </div>

        );

    }


    const statistics = dashboard?.statistics || {};


    return (

        <div className="min-h-screen bg-zinc-50">

            <div className="space-y-8">

                {/* Header */}

                <div className="flex flex-wrap items-center justify-between gap-4">

                    <div>

                        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
                            Dashboard Overview
                        </h1>

                        <p className="mt-2 text-sm text-zinc-500">
                            Monitor your ShopSphere store performance.
                        </p>

                    </div>

                    <button
                        onClick={() => loadDashboard(true)}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-60"
                    >

                        <RefreshCw
                            size={17}
                            className={refreshing ? "animate-spin" : ""}
                        />

                        {refreshing ? "Refreshing..." : "Refresh"}

                    </button>

                </div>


                {error && (
                    <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                        Refresh failed. Displaying the last successfully loaded data.
                    </p>
                )}


                {/* Statistics */}

                <section>

                    <div className="mb-4 flex items-center justify-between">

                        <h2 className="font-semibold text-zinc-800">
                            Store Statistics
                        </h2>

                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

                        <AdminStatCard
                            title="Total Revenue"
                            value={formatPrice(statistics.total_revenue)}
                            type="revenue"
                            description="Paid orders only"
                        />

                        <AdminStatCard
                            title="Total Orders"
                            value={statistics.total_orders ?? 0}
                            type="orders"
                            description="All store orders"
                        />

                        <AdminStatCard
                            title="Total Customers"
                            value={statistics.total_customers ?? 0}
                            type="customers"
                            description="Registered customers"
                        />

                        <AdminStatCard
                            title="Total Products"
                            value={statistics.total_products ?? 0}
                            type="products"
                            description="Products in catalog"
                        />

                    </div>

                </section>


                {/* Order Statistics */}

                <section>

                    <h2 className="mb-4 font-semibold text-zinc-800">
                        Order Performance
                    </h2>

                    <div className="grid gap-5 sm:grid-cols-3">

                        <AdminStatCard
                            title="Pending Orders"
                            value={statistics.pending_orders ?? 0}
                            type="pending"
                        />

                        <AdminStatCard
                            title="Delivered Orders"
                            value={statistics.delivered_orders ?? 0}
                            type="delivered"
                        />

                        <AdminStatCard
                            title="Cancelled Orders"
                            value={statistics.cancelled_orders ?? 0}
                            type="cancelled"
                        />

                    </div>

                </section>


                {/* Charts */}

                <section className="grid gap-6 xl:grid-cols-2">

                    <RevenueChart
                        data={dashboard?.monthly_revenue || []}
                    />

                    <OrderStatusChart
                        data={dashboard?.order_statuses || []}
                    />

                </section>


                {/* Recent Orders */}

                <section>

                    <RecentOrders
                        orders={dashboard?.recent_orders || []}
                    />

                </section>


                {/* Inventory */}

                <section className="grid gap-6 lg:grid-cols-2">

                    <LowStockProducts
                        variants={dashboard?.low_stock_variants || []}
                    />


                    {/* Quick Actions */}

                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

                        <h2 className="font-semibold text-zinc-900">
                            Quick Actions
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Access important store management pages.
                        </p>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">

                            <Link
                                to="/admin/products"
                                className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"
                            >

                                <Package className="text-indigo-600" size={21} />

                                <span className="text-sm font-semibold text-zinc-800">
                                    Manage Products
                                </span>

                            </Link>

                            <Link
                                to="/admin/orders"
                                className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"
                            >

                                <ShoppingBag className="text-indigo-600" size={21} />

                                <span className="text-sm font-semibold text-zinc-800">
                                    Manage Orders
                                </span>

                            </Link>

                            <Link
                                to="/admin/reviews"
                                className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"
                            >

                                <Users className="text-indigo-600" size={21} />

                                <span className="text-sm font-semibold text-zinc-800">
                                    Manage Reviews
                                </span>

                            </Link>

                            <Link
                                to="/admin/inventory"
                                className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"
                            >

                                <Package className="text-indigo-600" size={21} />

                                <span className="text-sm font-semibold text-zinc-800">
                                    Manage Inventory
                                </span>

                            </Link>

                        </div>

                    </div>

                </section>

            </div>

        </div>

    );

}