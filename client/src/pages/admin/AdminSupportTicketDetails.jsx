import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SupportConversation from "../../components/support/SupportConversation";
import {
  assignSupportTicketToMe,
  getAdminSupportTicket,
  replyToSupportTicket,
  updateSupportTicket,
} from "../../services/support-ticket.service";

const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const priorities = ["LOW", "NORMAL", "HIGH", "URGENT"];

export default function AdminSupportTicketDetails() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [olderLoading, setOlderLoading] = useState(false);
  const [replying, setReplying] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async (page = 1, prepend = false) => {
    if (prepend) setOlderLoading(true);
    else setLoading(true);
    setError("");
    try {
      const result = await getAdminSupportTicket(ticketId, { page, limit: 30 });
      setTicket(result.ticket);
      setMessages((current) => prepend ? [...result.messages, ...current] : result.messages);
      setPagination(result.pagination);
    } catch (loadError) {
      setError(loadError?.message || "Unable to load this support ticket.");
    } finally {
      setLoading(false);
      setOlderLoading(false);
    }
  }, [ticketId]);

  useEffect(() => { void load(); }, [load]);

  const submitReply = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const text = new FormData(form).get("message");
    setReplying(true);
    setError("");
    setMessage("");
    try {
      await replyToSupportTicket(ticketId, text);
      form.reset();
      await load(1, false);
      setMessage("Reply sent to the customer.");
    } catch (replyError) {
      setError(replyError?.message || "Unable to send your reply.");
    } finally {
      setReplying(false);
    }
  };

  const update = async (data) => {
    setError("");
    setMessage("");
    try {
      await updateSupportTicket(ticketId, data);
      await load(1, false);
      setMessage("Ticket updated.");
    } catch (updateError) {
      setError(updateError?.message || "Unable to update this ticket.");
    }
  };

  const assignToMe = async () => {
    setError("");
    try {
      await assignSupportTicketToMe(ticketId);
      await load(1, false);
      setMessage("Ticket assigned to you.");
    } catch (assignError) {
      setError(assignError?.message || "Unable to assign this ticket.");
    }
  };

  if (loading && !ticket) {
    return <div className="py-12 text-center text-sm text-zinc-500">Loading ticket…</div>;
  }

  return (
    <div className="space-y-4">
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-700">{message}</p>}
      {ticket && (
        <SupportConversation
          admin
          ticket={ticket}
          messages={messages}
          onReply={submitReply}
          replying={replying}
          replyDisabled={ticket.status === "CLOSED"}
          olderAvailable={pagination.page < pagination.total_pages}
          olderLoading={olderLoading}
          onLoadOlder={() => void load(pagination.page + 1, true)}
          controls={(
            <div className="flex flex-wrap gap-2">
              <select aria-label="Ticket status" value={ticket.status} onChange={(event) => void update({ status: event.target.value })} className="rounded-lg border border-zinc-300 px-2 py-2 text-xs font-semibold">
                {statuses.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
              </select>
              <select aria-label="Ticket priority" value={ticket.priority} onChange={(event) => void update({ priority: event.target.value })} className="rounded-lg border border-zinc-300 px-2 py-2 text-xs font-semibold">
                {priorities.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
              <button type="button" onClick={() => void assignToMe()} className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50">
                Assign to me
              </button>
            </div>
          )}
        />
      )}
      {loading && ticket && <p className="text-center text-xs text-zinc-400">Refreshing conversation…</p>}
    </div>
  );
}
