import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Headset, TicketPlus } from "lucide-react";
import { createSupportTicket } from "../../services/support-ticket.service";

const categories = [
  ["ORDER", "Order"],
  ["PAYMENT", "Payment"],
  ["SHIPPING", "Shipping"],
  ["RETURNS", "Returns and refunds"],
  ["PRODUCT", "Product"],
  ["ACCOUNT", "Account"],
  ["OTHER", "Other"],
];

export default function SupportCenter() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("ORDER");
  const [priority, setPriority] = useState("NORMAL");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const ticket = await createSupportTicket({ subject, category, priority, message });
      navigate(`/support/tickets/${ticket.ticket_id}`);
    } catch (submitError) {
      setError(submitError?.message || "Unable to create your support ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="rounded-3xl bg-gradient-to-r from-indigo-700 to-violet-600 p-7 text-white sm:p-9">
        <div className="flex items-center gap-3">
          <Headset size={25} />
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-100">Customer care</p>
        </div>
        <h1 className="mt-3 text-3xl font-bold">How can we help?</h1>
        <p className="mt-2 max-w-2xl text-sm text-indigo-100">
          Create a private support ticket and continue the conversation securely from your account.
        </p>
        <Link to="/support/tickets" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25">
          <TicketPlus size={16} /> View my tickets
        </Link>
      </header>

      <form onSubmit={submit} className="mt-7 space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-bold text-zinc-900">Create a support ticket</h2>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-zinc-700">
            Category
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5">
              {categories.map(([value, name]) => <option key={value} value={value}>{name}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-zinc-700">
            Priority
            <select value={priority} onChange={(event) => setPriority(event.target.value)} className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5">
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
            </select>
          </label>
        </div>
        <label className="block text-sm font-medium text-zinc-700">
          Subject
          <input value={subject} onChange={(event) => setSubject(event.target.value)} minLength={3} maxLength={180} required className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5" placeholder="Briefly describe the issue" />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Message
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} minLength={2} maxLength={5000} rows={6} required className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2.5" placeholder="Include the details our support team needs." />
          <span className="mt-1 block text-xs font-normal text-zinc-500">Your conversation is private and visible only to you and authorized support staff.</span>
        </label>
        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
            {submitting ? "Creating…" : "Create ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}
