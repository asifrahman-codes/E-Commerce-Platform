import { useCallback, useEffect, useState } from "react";

import { RefreshCw } from "lucide-react";

import adminOrderService from "../../services/admin-order.service";

import OrderFilters from "../../components/admin/orders/OrderFilters";

import OrdersTable from "../../components/admin/orders/OrdersTable";
import { AdminPageHeader, AdminPagination, AdminSkeleton } from "../../components/admin/AdminPrimitives";

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
        payment_status: "",
        sort: "newest"
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
                err.message ||
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
            payment_status: "",
            sort: "newest"
        });

        setPagination(previous => ({
            ...previous,
            page: 1
        }));

    };

    return (

        <div className="space-y-6">

            {/* Header */}

            <AdminPageHeader
                eyebrow="Sales operations"
                title="Orders"
                description="Search, filter, and review customer orders and their payment state."
                actions={
                    <button
                        type="button"
                        onClick={loadOrders}
                        disabled={loading}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                }
            />

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

                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                    <AdminSkeleton rows={5} columns={7} />
                </div>

            ) : (

                <OrdersTable orders={orders} />

            )}

            {/* Pagination */}

            {!loading && pagination.total_pages > 1 && (
                <AdminPagination
                    page={pagination.page}
                    totalPages={pagination.total_pages}
                    total={pagination.total}
                    onPageChange={(nextPage) => setPagination((current) => ({ ...current, page: nextPage }))}
                />
            )}

        </div>

    );

}