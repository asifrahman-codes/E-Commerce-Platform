import { useCallback, useEffect, useState } from "react";

import { RefreshCw, ShoppingBag } from "lucide-react";

import adminOrderService from "../../services/admin-order.service";

import OrderFilters from "../../components/admin/orders/OrderFilters";

import OrdersTable from "../../components/admin/orders/OrdersTable";

export default function AdminOrders() {

    const [orders, setOrders] = useState([]);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0
    });

    const [filters, setFilters] = useState({
        search: "",
        status: "",
        payment_status: ""
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadOrders = useCallback(async () => {

        try {

            setLoading(true);
            setError("");

            const data = await adminOrderService.getOrders({
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            });

            setOrders(data.orders || []);

            setPagination(previous => ({
                ...previous,
                ...data.pagination
            }));

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to load orders."
            );

        } finally {

            setLoading(false);

        }

    }, [
        pagination.page,
        pagination.limit,
        filters
    ]);

    useEffect(() => {

        const timer = setTimeout(() => {
            loadOrders();
        }, 300);

        return () => clearTimeout(timer);

    }, [loadOrders]);

    const handleFilterChange = (nextFilters) => {

        setFilters(nextFilters);

        setPagination(previous => ({
            ...previous,
            page: 1
        }));

    };

    const resetFilters = () => {

        setFilters({
            search: "",
            status: "",
            payment_status: ""
        });

        setPagination(previous => ({
            ...previous,
            page: 1
        }));

    };

    return (

        <div className="space-y-7 m-6">

            {/* Header */}

            <div className="flex flex-wrap items-center justify-between gap-4">

                <div>

                    <div className="flex items-center gap-3">

                        <ShoppingBag
                            size={28}
                            className="text-indigo-600"
                        />

                        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
                            Order Management
                        </h1>

                    </div>

                    <p className="mt-2 text-sm text-zinc-500">
                        Manage and monitor customer orders.
                    </p>

                </div>

                <button
                    onClick={loadOrders}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-zinc-50 disabled:opacity-60"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>

            </div>

            {/* Order count */}

            <div className="rounded-xl border border-zinc-200 bg-white p-4">

                <p className="text-sm text-zinc-500">
                    Total orders
                </p>

                <p className="mt-1 text-2xl font-bold text-zinc-900">
                    {pagination.total}
                </p>

            </div>

            {/* Filters */}

            <OrderFilters
                filters={filters}
                onChange={handleFilterChange}
                onReset={resetFilters}
            />

            {/* Error */}

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                    <button
                        onClick={loadOrders}
                        className="ml-3 font-semibold underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Orders */}

            {loading ? (

                <div className="flex min-h-60 items-center justify-center">
                    <div className="h-9 w-9 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600" />
                </div>

            ) : (

                <OrdersTable orders={orders} />

            )}

            {/* Pagination */}

            {!loading && pagination.total_pages > 1 && (

                <div className="flex flex-wrap items-center justify-between gap-4">

                    <p className="text-sm text-zinc-500">
                        Page {pagination.page} of {pagination.total_pages}
                    </p>

                    <div className="flex gap-2">

                        <button
                            disabled={pagination.page <= 1}
                            onClick={() => setPagination(p => ({
                                ...p,
                                page: p.page - 1
                            }))}
                            className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <button
                            disabled={pagination.page >= pagination.total_pages}
                            onClick={() => setPagination(p => ({
                                ...p,
                                page: p.page + 1
                            }))}
                            className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-40"
                        >
                            Next
                        </button>

                    </div>

                </div>

            )}

        </div>

    );

}