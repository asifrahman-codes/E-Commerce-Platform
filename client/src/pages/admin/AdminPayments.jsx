import { useCallback, useEffect, useState } from "react";
import { CreditCard, ExternalLink, Search } from "lucide-react";
import { Link } from "react-router-dom";

import {
  AdminCard,
  AdminEmptyState,
  AdminPageHeader,
  AdminPagination,
  AdminSkeleton,
  AdminStatusBadge,
} from "../../components/admin/AdminPrimitives";
import adminOrderService from "../../services/admin-order.service";
import { formatPrice } from "../../utils/product.utils";

const PAGE_SIZE = 10;

const toneForStatus = (status) => {
  if (status === "PAID") return "green";
  if (status === "PENDING") return "amber";
  if (status === "FAILED" || status === "REFUNDED") return "red";
  return "neutral";
};

export default function AdminPayments() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: "", payment_status: "" });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await adminOrderService.getOrders({
        page,
        limit: PAGE_SIZE,
        search: filters.search,
        payment_status: filters.payment_status,
      });
      setOrders(Array.isArray(result?.orders) ? result.orders : []);
      setPagination({
        page: Number(result?.pagination?.page || page),
        total_pages: Number(result?.pagination?.total_pages || 1),
        total: Number(result?.pagination?.total || 0),
      });
    } catch (loadError) {
      setError(loadError.message || loadError.response?.data?.message || "Unable to load payment records.");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    const timer = window.setTimeout(loadPayments, 250);
    return () => window.clearTimeout(timer);
  }, [loadPayments]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Finance"
        title="Payments"
        description="Review payment status and totals from real order records."
      />

      {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><span>{error}</span><button type="button" onClick={loadPayments} className="font-semibold underline">Retry</button></div>}

      <AdminCard
        title="Payment activity"
        description={pagination.total.toLocaleString() + " orders"}
        action={
          <div className="flex flex-wrap gap-2">
            <label className="relative">
              <span className="sr-only">Search payments</span>
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} placeholder="Order or customer…" className="h-9 w-48 rounded-lg border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-[#759c84]" />
            </label>
            <select aria-label="Filter by payment status" value={filters.payment_status} onChange={(event) => updateFilter("payment_status", event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600">
              <option value="">All payment statuses</option><option value="PENDING">Pending</option><option value="PAID">Paid</option><option value="FAILED">Failed</option><option value="REFUNDED">Refunded</option>
            </select>
          </div>
        }
      >
        {loading ? <AdminSkeleton rows={5} columns={6} /> : orders.length === 0 ? (
          <AdminEmptyState title="No payment records found" description={filters.search || filters.payment_status ? "Try changing the search or status filter." : "Payments will appear here as orders are created."} />
        ) : (
          <>
            <div className="overflow-x-auto overscroll-x-contain touch-pan-x">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500"><tr><th className="px-5 py-3.5">Order</th><th className="px-5 py-3.5">Customer</th><th className="px-5 py-3.5">Order date</th><th className="px-5 py-3.5">Amount</th><th className="px-5 py-3.5">Payment status</th><th className="px-5 py-3.5 text-right">Details</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.order_id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4 font-semibold text-slate-800">{order.order_number}</td>
                      <td className="px-5 py-4"><p className="font-medium text-slate-700">{order.first_name} {order.last_name}</p><p className="mt-0.5 text-xs text-slate-500">{order.email}</p></td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}</td>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">{formatPrice(order.total)}</td>
                      <td className="px-5 py-4"><AdminStatusBadge tone={toneForStatus(order.payment_status)}>{order.payment_status || "UNKNOWN"}</AdminStatusBadge></td>
                      <td className="px-5 py-4 text-right"><Link to={`/admin/orders/${order.order_id}`} aria-label={`Open order ${order.order_number}`} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-white hover:text-[#315d47]"><CreditCard size={14} />Details<ExternalLink size={13} /></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPagination page={pagination.page} totalPages={pagination.total_pages} total={pagination.total} onPageChange={setPage} />
          </>
        )}
      </AdminCard>
    </div>
  );
}
