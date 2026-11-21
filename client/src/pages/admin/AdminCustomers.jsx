import { useCallback, useEffect, useState } from "react";
import AdminStatCard from "../../components/admin/AdminStatCard";
import { AdminCard, AdminEmptyState, AdminPageHeader } from "../../components/admin/AdminPrimitives";
import { getAdminDashboard } from "../../services/admin.service";

export default function AdminCustomers() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setDashboard(await getAdminDashboard());
    } catch (loadError) {
      setError(loadError.message || loadError.response?.data?.message || "Unable to load customer analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const customerStats = dashboard?.customer_analytics;

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Customer insights" title="Customers" description="Customer counts and purchasing activity from the existing admin analytics API." />
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}<button type="button" onClick={load} className="ml-3 font-semibold underline">Retry</button></p>}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />)}</div>
      ) : !customerStats ? (
        <AdminCard><AdminEmptyState title="Customer analytics unavailable" description="The customer analytics endpoint returned no summary." /></AdminCard>
      ) : (
        <>
          <section aria-label="Customer statistics" className="grid gap-4 md:grid-cols-3">
            <AdminStatCard title="Total customers" value={Number(customerStats.total_customers || 0).toLocaleString()} type="customers" description="Registered customer accounts" />
            <AdminStatCard title="New customers" value={Number(customerStats.new_customers || 0).toLocaleString()} type="growth" description="Registered in the last 30 days" />
            <AdminStatCard title="Customers with orders" value={Number(customerStats.customers_with_orders || 0).toLocaleString()} type="orders" description="Distinct customers with purchases" />
          </section>
          <AdminCard title="Customer records" description="Summary-only data">
            <AdminEmptyState title="Individual customer directory isn’t available" description="The current API exposes aggregate customer metrics only. No customer list has been fabricated; a customer-directory endpoint is needed for search, profile details, and pagination." />
          </AdminCard>
        </>
      )}
    </div>
  );
}
