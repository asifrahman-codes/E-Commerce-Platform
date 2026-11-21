import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import AdminStatCard from "../../components/admin/AdminStatCard";
import LowStockProducts from "../../components/admin/LowStockProducts";
import OrderStatusChart from "../../components/admin/OrderStatusChart";
import RecentOrders from "../../components/admin/RecentOrders";
import RevenueChart from "../../components/admin/RevenueChart";
import TopSellingProducts from "../../components/admin/TopSellingProducts";
import { AdminPageHeader, AdminSkeleton } from "../../components/admin/AdminPrimitives";
import { getAdminDashboard } from "../../services/admin.service";
import { formatPrice } from "../../utils/product.utils";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const data = await getAdminDashboard();
      setDashboard(data);
    } catch (loadError) {
      setError(loadError.message || loadError.response?.data?.message || "Unable to load admin dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const stats = dashboard?.statistics || {};
  const customerStats = dashboard?.customer_analytics || {};

  if (loading && !dashboard) {
    return (
      <div className="space-y-6">
        <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />)}
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]"><div className="h-[360px] animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" /><AdminSkeleton rows={5} columns={1} /></div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-white p-8">
        <h1 className="text-lg font-bold text-slate-900">Dashboard unavailable</h1>
        <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>
        <button type="button" onClick={() => loadDashboard()} className="mt-5 rounded-xl bg-[#315d47] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#244b39]">Try again</button>
      </div>
    );
  }

  const cards = [
    { title: "Paid revenue", value: formatPrice(stats.total_revenue), type: "revenue", description: "Successful payments" },
    { title: "Total orders", value: Number(stats.total_orders || 0).toLocaleString(), type: "orders", description: "All recorded orders" },
    { title: "Pending orders", value: Number(stats.pending_orders || 0).toLocaleString(), type: "pending", description: "Require attention" },
    { title: "Customers", value: Number(stats.total_customers || 0).toLocaleString(), type: "customers", description: `${Number(customerStats.new_customers || 0).toLocaleString()} joined in 30 days` },
    { title: "Products", value: Number(stats.total_products || 0).toLocaleString(), type: "products", description: "Catalog products" },
    { title: "Delivered", value: Number(stats.delivered_orders || 0).toLocaleString(), type: "delivered", description: "Successfully delivered" },
    { title: "Customers with orders", value: Number(customerStats.customers_with_orders || 0).toLocaleString(), type: "growth", description: "Distinct purchasing customers" },
    { title: "Low-stock variants", value: Number(dashboard?.low_stock_variants?.length || 0).toLocaleString(), type: "inventory", description: "Five or fewer units" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Store overview"
        title="Dashboard"
        description="A live snapshot of ShopSphere sales, orders, customers, and inventory."
        actions={
          <button type="button" onClick={() => loadDashboard(true)} disabled={refreshing} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
        }
      />

      {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Refresh failed. Showing the last loaded data. {error}</p>}

      <section aria-label="Store statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => <AdminStatCard key={card.title} {...card} />)}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <RevenueChart data={dashboard?.monthly_revenue || []} />
        <OrderStatusChart data={dashboard?.order_statuses || []} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <TopSellingProducts products={dashboard?.top_selling_products || []} />
        <LowStockProducts variants={dashboard?.low_stock_variants || []} />
      </section>

      <RecentOrders orders={dashboard?.recent_orders || []} />
    </div>
  );
}
