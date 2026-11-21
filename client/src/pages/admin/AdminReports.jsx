import { useCallback, useEffect, useState } from "react";

import LowStockProducts from "../../components/admin/LowStockProducts";
import OrderStatusChart from "../../components/admin/OrderStatusChart";
import RecentOrders from "../../components/admin/RecentOrders";
import RevenueChart from "../../components/admin/RevenueChart";
import TopSellingProducts from "../../components/admin/TopSellingProducts";
import { AdminPageHeader } from "../../components/admin/AdminPrimitives";
import { getAdminDashboard } from "../../services/admin.service";

export default function AdminReports() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setDashboard(await getAdminDashboard());
    } catch (loadError) {
      setError(loadError.message || loadError.response?.data?.message || "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Analytics" title="Reports" description="Revenue, order status, product sales, and inventory alerts from recorded store data." />
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}<button type="button" onClick={load} className="ml-3 font-semibold underline">Retry</button></div>}
      {loading && !dashboard ? (
        <div className="grid gap-5 xl:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-72 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />)}</div>
      ) : dashboard && (
        <>
          <div className="grid gap-5 xl:grid-cols-2">
            <RevenueChart data={dashboard.monthly_revenue || []} />
            <OrderStatusChart data={dashboard.order_statuses || []} />
            <TopSellingProducts products={dashboard.top_selling_products || []} />
            <LowStockProducts variants={dashboard.low_stock_variants || []} />
          </div>
          <RecentOrders orders={dashboard.recent_orders || []} />
        </>
      )}
    </div>
  );
}
