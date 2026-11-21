import { Award, Package } from "lucide-react";
import { formatPrice } from "../../utils/product.utils";
import { AdminCard, AdminEmptyState } from "./AdminPrimitives";

export default function TopSellingProducts({ products = [] }) {
  const rows = Array.isArray(products) ? products : [];
  const maxSold = Math.max(1, ...rows.map((product) => Number(product.total_sold) || 0));

  return (
    <AdminCard title="Top-selling products" description="Units sold across non-cancelled orders">
      {rows.length === 0 ? (
        <AdminEmptyState title="No sales data yet" description="Best sellers will appear when order items have been recorded." />
      ) : (
        <div className="divide-y divide-slate-100">
          {rows.map((product, index) => {
            const sold = Number(product.total_sold) || 0;
            return (
              <div key={`${product.variant_id || product.product_name}-${index}`} className="flex items-center gap-3 px-5 py-4 sm:px-6">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                  {index === 0 ? <Award size={17} className="text-amber-500" /> : <Package size={17} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-800">{product.product_name || "Unnamed product"}</p>
                    <span className="whitespace-nowrap text-xs font-semibold text-slate-700">{sold.toLocaleString()} sold</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-[#527d65]" style={{ width: `${Math.min(100, (sold / maxSold) * 100)}%` }} />
                    </div>
                    <span className="whitespace-nowrap text-[11px] text-slate-500">{formatPrice(product.total_sales)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminCard>
  );
}
