import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Search, Truck } from "lucide-react";
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

export default function AdminShipments() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0 });
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadShipments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await adminOrderService.getOrders({
        page,
        limit: PAGE_SIZE,
        search: query,
        status: "SHIPPED",
      });
      setOrders(Array.isArray(result?.orders) ? result.orders : []);
      setPagination({
        page: Number(result?.pagination?.page || page),
        total_pages: Number(result?.pagination?.total_pages || 1),
        total: Number(result?.pagination?.total || 0),
      });
    } catch (loadError) {
      setError(loadError.message || loadError.response?.data?.message || "Unable to load the shipment queue.");
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    const timer = window.setTimeout(loadShipments, 250);
    return () => window.clearTimeout(timer);
  }, [loadShipments]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Fulfillment"
        title="Shipments"
        description="Orders marked shipped. Open an order to create or update carrier tracking details."
      />

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}<button type="button" onClick={loadShipments} className="ml-3 font-semibold underline">Retry</button></div>}

      <AdminCard
        title="Shipped orders"
        description={`${pagination.total.toLocaleString()} matching orders`}
        action={
          <label className="relative">
            <span className="sr-only">Search shipped orders</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search order or customer…" className="h-9 w-52 rounded-lg border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-[#759c84]" />
          </label>
        }
      >
        {loading ? <AdminSkeleton rows={5} columns={5} /> : orders.length === 0 ? (
          <AdminEmptyState title="No shipped orders" description={query ? "Try a different search term." : "Orders with a shipped status will appear here. Shipment creation and tracking updates are available from order details."} />
        ) : (
          <>
            <div className="overflow-x-auto overscroll-x-contain touch-pan-x">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500"><tr><th className="px-5 py-3.5">Order</th><th className="px-5 py-3.5">Customer</th><th className="px-5 py-3.5">Order date</th><th className="px-5 py-3.5">Total</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5 text-right">Tracking</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.order_id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4 font-semibold text-slate-800">{order.order_number}</td>
                      <td className="px-5 py-4"><p className="font-medium text-slate-700">{order.first_name} {order.last_name}</p><p className="mt-0.5 text-xs text-slate-500">{order.email}</p></td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}</td>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">{formatPrice(order.total)}</td>
                      <td className="px-5 py-4"><AdminStatusBadge tone="blue"><span className="inline-flex items-center gap-1"><Truck size={12} />{order.status}</span></AdminStatusBadge></td>
                      <td className="px-5 py-4 text-right"><Link to={`/admin/orders/${order.order_id}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#315d47]">Manage tracking <ArrowUpRight size={14} /></Link></td>
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
