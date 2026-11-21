import { useCallback, useEffect, useState } from "react";
import { Award, ChevronLeft, ChevronRight, Coins, RefreshCw } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getLoyaltyAccount, getLoyaltyTransactions } from "../../services/loyalty.service";
import { formatPrice } from "../../utils/product.utils";
import { getErrorMessage } from "../../utils/error.utils";

const labels = {
  EARN: "Points earned",
  REDEEM: "Points redeemed",
  REDEEM_RESTORE: "Redeemed points restored",
  REVERSAL: "Points adjusted after refund",
  EXPIRY: "Expired points",
  ADJUSTMENT: "Account adjustment",
};

export default function LoyaltyDashboard() {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [accountData, history] = await Promise.all([
        getLoyaltyAccount(),
        getLoyaltyTransactions(page),
      ]);
      setAccount(accountData);
      setTransactions(history.transactions);
      setPagination(history.pagination);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !account) {
    return <div className="flex min-h-64 items-center justify-center"><LoadingSpinner /></div>;
  }

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Rewards</p>
        <h2 className="mt-1 text-2xl font-bold text-zinc-900">Loyalty points</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Earn 1 point per PKR 100 of eligible merchandise after discounts. Points are awarded after an order is delivered and paid.
        </p>
      </header>

      {error && (
        <div role="alert" className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button type="button" onClick={load} className="inline-flex items-center gap-2 font-semibold">
            <RefreshCw size={15} /> Retry
          </button>
        </div>
      )}

      {account && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-indigo-700 p-6 text-white shadow-sm">
            <div className="flex items-center gap-2 text-indigo-100"><Coins size={19} /> Available balance</div>
            <p className="mt-4 text-4xl font-bold">{Number(account.balance).toLocaleString()}</p>
            <p className="mt-2 text-sm text-indigo-100">
              {Number(account.currency_per_point) > 0
                ? `${formatPrice(account.currency_per_point)} value per point at checkout`
                : "Redeem points at checkout"}
            </p>
            {Number(account.balance) < 0 && (
              <p className="mt-3 text-sm text-amber-100">
                A refund adjustment is being offset by future points.
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-zinc-600"><Award size={19} /> Lifetime points earned</div>
            <p className="mt-4 text-4xl font-bold text-zinc-900">{Number(account.lifetime_earned).toLocaleString()}</p>
            <p className="mt-2 text-sm text-zinc-500">
              {account.expiry_days == null ? "Points do not expire." : `Points expire after ${account.expiry_days} days.`}
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-4">
          <h3 className="font-semibold text-zinc-900">Points activity</h3>
        </div>
        {transactions.length === 0 ? (
          <div className="p-10 text-center text-sm text-zinc-500">
            Your reward activity will appear here after you earn or redeem points.
          </div>
        ) : (
          <>
            <ul className="divide-y divide-zinc-100">
              {transactions.map((entry) => (
                <li key={entry.transaction_id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="font-medium text-zinc-900">{labels[entry.transaction_type] || entry.transaction_type}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {entry.order_id ? `Order #${entry.order_id} · ` : ""}
                      {new Date(entry.created_at).toLocaleString()}
                      {Number(entry.currency_amount) > 0 ? ` · ${formatPrice(entry.currency_amount)}` : ""}
                    </p>
                  </div>
                  <span className={`shrink-0 font-semibold ${Number(entry.points_change) >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {Number(entry.points_change) > 0 ? "+" : ""}{Number(entry.points_change).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
            {pagination.total_pages > 1 && (
              <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3 text-sm">
                <span className="text-zinc-500">Page {pagination.page} of {pagination.total_pages}</span>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border p-2 disabled:opacity-40" aria-label="Previous page"><ChevronLeft size={17} /></button>
                  <button disabled={page >= pagination.total_pages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border p-2 disabled:opacity-40" aria-label="Next page"><ChevronRight size={17} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
