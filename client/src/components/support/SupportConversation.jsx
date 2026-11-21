import { Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";

const label = (value) => String(value || "").replaceAll("_", " ");

export default function SupportConversation({
  ticket,
  messages,
  onReply,
  replying,
  replyDisabled,
  olderAvailable,
  olderLoading,
  onLoadOlder,
  admin = false,
  controls = null,
}) {
  return (
    <section className="space-y-5">
      <Link
        to={admin ? "/admin/support" : "/support/tickets"}
        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
      >
        <ArrowLeft size={16} /> {admin ? "Ticket dashboard" : "My tickets"}
      </Link>

      <header className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Ticket #{ticket.ticket_id} · {label(ticket.status)}
            </p>
            <h1 className="mt-1 text-xl font-bold text-zinc-900">{ticket.subject}</h1>
            <p className="mt-2 text-sm text-zinc-500">
              {label(ticket.category)} · {label(ticket.priority)}
            </p>
            {admin && (
              <p className="mt-1 text-xs text-zinc-500">
                Customer: {ticket.customer_name || "Customer"}
                {ticket.customer_email ? ` · ${ticket.customer_email}` : ""}
                {ticket.assignee_name ? ` · Assigned to ${ticket.assignee_name}` : " · Unassigned"}
              </p>
            )}
          </div>
          {controls}
        </div>
      </header>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
        {olderAvailable && (
          <div className="mb-5 text-center">
            <button
              type="button"
              onClick={onLoadOlder}
              disabled={olderLoading}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 disabled:opacity-50"
            >
              {olderLoading ? "Loading…" : "Load older messages"}
            </button>
          </div>
        )}
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">No messages in this ticket yet.</p>
        ) : (
          <ol className="space-y-4">
            {messages.map((message) => {
              const isAdminMessage = message.sender_role === "ADMIN";
              return (
                <li
                  key={message.message_id}
                  className={`max-w-3xl rounded-2xl p-4 ${
                    isAdminMessage ? "bg-indigo-50" : "bg-zinc-50"
                  } ${isAdminMessage ? "ml-auto" : ""}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-zinc-800">
                      {isAdminMessage ? (admin ? "Support" : "ShopSphere Support") : (admin ? "Customer" : "You")}
                    </p>
                    <time className="text-xs text-zinc-400" dateTime={message.created_at}>
                      {new Date(message.created_at).toLocaleString()}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-700">
                    {message.message_text}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <form onSubmit={onReply} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        {replyDisabled ? (
          <p className="text-sm text-zinc-500">This ticket is closed. Create a new ticket if you need more help.</p>
        ) : (
          <>
            <label htmlFor="support-reply" className="block text-sm font-semibold text-zinc-800">
              {admin ? "Reply to customer" : "Add a reply"}
            </label>
            <textarea
              id="support-reply"
              name="message"
              minLength={2}
              maxLength={5000}
              rows={4}
              required
              placeholder="Write your message…"
              className="mt-3 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={replying}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send size={15} /> {replying ? "Sending…" : "Send reply"}
              </button>
            </div>
          </>
        )}
      </form>
    </section>
  );
}
