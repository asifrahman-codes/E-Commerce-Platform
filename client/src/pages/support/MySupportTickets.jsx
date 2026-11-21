import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquareText, Plus } from "lucide-react";
import { getMySupportTickets } from "../../services/support-ticket.service";

const statusClass = {
  OPEN: "bg-sky-50 text-sky-700",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  RESOLVED: "bg-emerald-50 text-emerald-700",
  CLOSED: "bg-zinc-100 text-zinc-600",
};

export default function MySupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState("");
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
      const result = await getMySupportTickets({ page, limit: 20, status, search });
      setTickets(result.tickets);
      setPagination(result.pagination);
    } catch (loadError) {
      setError(loadError?.message || "Unable to load your support tickets.");
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Customer care</p>
          <h1 className="mt-1 text-3xl font-bold text-zinc-900">My support tickets</h1>
          <p className="mt-2 text-sm text-zinc-500">Review ticket status and continue private conversations with support.</p>
        </div>
        <Link to="/support" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={17} /> New ticket
        </Link>
      </header>

      <form
        className="mt-6 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setSearch(searchInput.trim());
        }}
      >
        <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} maxLength={100} placeholder="Search subject or ticket number" className="min-w-0 flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm" />
        <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <button className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">Search</button>
      </form>

      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="py-12 text-center text-sm text-zinc-500">Loading tickets…</p>
      ) : tickets.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 p-12 text-center">
          <MessageSquareText className="mx-auto text-zinc-400" size={32} />
          <h2 className="mt-3 font-semibold text-zinc-900">No tickets found</h2>
          <p className="mt-1 text-sm text-zinc-500">New support conversations will appear here.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {tickets.map((ticket) => (
            <Link key={ticket.ticket_id} to={`/support/tickets/${ticket.ticket_id}`} className="block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Ticket #{ticket.ticket_id} · {ticket.category}</p>
                  <h2 className="mt-1 font-semibold text-zinc-900">{ticket.subject}</h2>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass[ticket.status] || statusClass.CLOSED}`}>
                  {ticket.status.replaceAll("_", " ")}
                </span>
              </div>
              {ticket.latest_message && <p className="mt-3 line-clamp-2 text-sm text-zinc-600">{ticket.latest_message}</p>}
              <p className="mt-3 text-xs text-zinc-400">Updated {new Date(ticket.updated_at).toLocaleString()}</p>
            </Link>
          ))}
        </div>
      )}

      {pagination.total_pages > 1 && (
        <nav className="mt-6 flex items-center justify-between">
          <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Previous</button>
          <span className="text-sm text-zinc-500">Page {page} of {pagination.total_pages}</span>
          <button type="button" disabled={page >= pagination.total_pages || loading} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Next</button>
        </nav>
      )}
    </div>
  );
}
