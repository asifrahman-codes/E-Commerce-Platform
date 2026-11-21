import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SupportConversation from "../../components/support/SupportConversation";
import {
  getMySupportTicket,
  replyToMySupportTicket,
} from "../../services/support-ticket.service";

export default function SupportTicketDetails() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [olderLoading, setOlderLoading] = useState(false);
  const [replying, setReplying] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (page = 1, prepend = false) => {
    if (prepend) setOlderLoading(true);
    else setLoading(true);
    setError("");
    try {
      const result = await getMySupportTicket(ticketId, { page, limit: 30 });
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
    const message = new FormData(form).get("message");
    setReplying(true);
    setError("");
    try {
      await replyToMySupportTicket(ticketId, message);
      form.reset();
      await load(1, false);
    } catch (replyError) {
      setError(replyError?.message || "Unable to send your reply.");
    } finally {
      setReplying(false);
    }
  };

  if (loading && !ticket) {
    return <div className="mx-auto max-w-4xl px-4 py-12 text-center text-sm text-zinc-500">Loading ticket…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {ticket && (
        <SupportConversation
          ticket={ticket}
          messages={messages}
          onReply={submitReply}
          replying={replying}
          replyDisabled={ticket.status === "CLOSED"}
          olderAvailable={pagination.page < pagination.total_pages}
          olderLoading={olderLoading}
          onLoadOlder={() => void load(pagination.page + 1, true)}
        />
      )}
      {loading && ticket && <p className="mt-3 text-center text-xs text-zinc-400">Refreshing conversation…</p>}
    </div>
  );
}
