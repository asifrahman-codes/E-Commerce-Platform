import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { getAdminSupportTickets } from "../../services/support-ticket.service";

const categories = ["ORDER", "PAYMENT", "SHIPPING", "RETURNS", "PRODUCT", "ACCOUNT", "OTHER"];
const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

const statusClass = {
  OPEN: "bg-sky-50 text-sky-700",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  RESOLVED: "bg-emerald-50 text-emerald-700",
  CLOSED: "bg-zinc-100 text-zinc-600",
};

export default function AdminSupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState("OPEN");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminSupportTickets({
        page, limit: 20, status, category, priority, search,
      });
      setTickets(result.tickets);
      setPagination(result.pagination);
    } catch (loadError) {
      setError(loadError?.message || "Unable to load support tickets.");
    } finally {
      setLoading(false);
    }
  }, [page, status, category, priority, search]);

  useEffect(() => { void load(); }, [load]);

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Customer care</p>
        <h1 className="mt-1 text-3xl font-bold text-zinc-900">Support tickets</h1>
        <p className="mt-2 text-sm text-zinc-500">Search, filter, assign and respond to private customer conversations.</p>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setSearch(searchInput.trim());
        }}
        className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-[1fr_auto_auto_auto_auto]"
      >
        <label className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} maxLength={100} placeholder="Ticket, subject, customer or email" className="w-full rounded-xl border border-zinc-300 py-2 pl-9 pr-3 text-sm" />
        </label>
        <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {statuses.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
        </select>
        <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm">
          <option value="">All categories</option>
          {categories.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select value={priority} onChange={(event) => { setPriority(event.target.value); setPage(1); }} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm">
          <option value="">All priorities</option>
          {["URGENT", "HIGH", "NORMAL", "LOW"].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Search</button>
      </form>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="py-12 text-center text-sm text-zinc-500">Loading tickets…</p>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-sm text-zinc-500">
          No tickets match these filters.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <ul className="divide-y divide-zinc-100">
            {tickets.map((ticket) => (
              <li key={ticket.ticket_id}>
                <Link to={`/admin/support/${ticket.ticket_id}`} className="block p-4 transition hover:bg-zinc-50 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">#{ticket.ticket_id} · {ticket.category} · {ticket.priority}</p>
                      <h2 className="mt-1 font-semibold text-zinc-900">{ticket.subject}</h2>
                      <p className="mt-1 text-sm text-zinc-500">{ticket.customer_name || "Customer"} · {ticket.customer_email}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass[ticket.status] || statusClass.CLOSED}`}>
                      {ticket.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-400">
                    {ticket.assignee_name ? `Assigned to ${ticket.assignee_name}` : "Unassigned"} · Updated {new Date(ticket.updated_at).toLocaleString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pagination.total_pages > 1 && (
        <nav className="flex items-center justify-between">
          <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Previous</button>
          <span className="text-sm text-zinc-500">Page {page} of {pagination.total_pages}</span>
          <button type="button" disabled={page >= pagination.total_pages || loading} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Next</button>
        </nav>
      )}
    </section>
  );
}
