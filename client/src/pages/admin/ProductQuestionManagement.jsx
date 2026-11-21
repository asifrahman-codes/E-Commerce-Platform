import { useCallback, useEffect, useState } from "react";
import {
  answerProductQuestion,
  getAdminProductQuestions,
  moderateProductAnswer,
  moderateProductQuestion,
} from "../../services/product-qa.service";

const moderationStatuses = ["APPROVED", "REJECTED", "HIDDEN"];

export default function ProductQuestionManagement() {
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState("PENDING");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState({});
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminProductQuestions({ page, limit: 20, status, search });
      setQuestions(result.questions);
      setPagination(result.pagination);
    } catch (loadError) {
      setError(loadError?.message || "Unable to load product questions.");
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => { void load(); }, [load]);

  const moderateQuestion = async (questionId, nextStatus) => {
    setWorkingId(questionId);
    setError("");
    setMessage("");
    try {
      await moderateProductQuestion(questionId, { status: nextStatus });
      setMessage(`Question ${nextStatus.toLowerCase()}.`);
      await load();
    } catch (moderationError) {
      setError(moderationError?.message || "Unable to moderate this question.");
    } finally {
      setWorkingId(null);
    }
  };

  const moderateAnswer = async (answerId, nextStatus) => {
    setWorkingId(answerId);
    setError("");
    setMessage("");
    try {
      await moderateProductAnswer(answerId, { status: nextStatus });
      setMessage(`Answer ${nextStatus.toLowerCase()}.`);
      await load();
    } catch (moderationError) {
      setError(moderationError?.message || "Unable to moderate this answer.");
    } finally {
      setWorkingId(null);
    }
  };

  const submitAnswer = async (event, questionId) => {
    event.preventDefault();
    const answer = drafts[questionId]?.trim() || "";
    if (!answer) return;
    setWorkingId(questionId);
    setError("");
    setMessage("");
    try {
      await answerProductQuestion(questionId, answer);
      setDrafts((previous) => ({ ...previous, [questionId]: "" }));
      setMessage("Answer submitted for moderation.");
      await load();
    } catch (answerError) {
      setError(answerError?.message || "Unable to submit this answer.");
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Catalog moderation</p>
        <h1 className="mt-1 text-3xl font-bold text-zinc-900">Product Q&amp;A</h1>
        <p className="mt-2 text-sm text-zinc-500">Review customer questions, prepare answers, and moderate publication separately.</p>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setSearch(searchInput.trim());
        }}
        className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row"
      >
        <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} maxLength={100} placeholder="Search product, question, or answer" className="min-w-0 flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm" />
        <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm">
          <option value="">All question statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="HIDDEN">Hidden</option>
        </select>
        <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Search</button>
      </form>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-700">{message}</p>}
      {loading ? (
        <p className="py-12 text-center text-sm text-zinc-500">Loading questions…</p>
      ) : questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500">No questions match this filter.</div>
      ) : (
        <div className="space-y-4">
          {questions.map((item) => (
            <article key={item.question_id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{item.product_name} · Customer #{item.user_id}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-800">{item.question_text}</p>
                  <time className="mt-2 block text-xs text-zinc-400" dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time>
                </div>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">{item.status}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {moderationStatuses.map((nextStatus) => (
                  <button
                    key={nextStatus}
                    type="button"
                    disabled={workingId === item.question_id || item.status === nextStatus}
                    onClick={() => void moderateQuestion(item.question_id, nextStatus)}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
                  >
                    {nextStatus.charAt(0) + nextStatus.slice(1).toLowerCase()} question
                  </button>
                ))}
              </div>

              {item.answer_id && (
                <div className="mt-5 rounded-xl bg-zinc-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Answer · {item.answer_status}</p>
                    <div className="flex gap-2">
                      {moderationStatuses.map((nextStatus) => (
                        <button
                          key={nextStatus}
                          type="button"
                          disabled={workingId === item.answer_id || item.answer_status === nextStatus}
                          onClick={() => void moderateAnswer(item.answer_id, nextStatus)}
                          className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-semibold text-zinc-700 disabled:opacity-40"
                        >
                          {nextStatus.charAt(0) + nextStatus.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700">{item.answer_text}</p>
                  {item.answer_moderation_reason && <p className="mt-2 text-xs text-red-600">{item.answer_moderation_reason}</p>}
                </div>
              )}

              {item.status !== "REJECTED" && item.status !== "HIDDEN" && (
                <form onSubmit={(event) => void submitAnswer(event, item.question_id)} className="mt-4">
                  <label htmlFor={`answer-${item.question_id}`} className="block text-sm font-semibold text-zinc-700">
                    {item.answer_id ? "Replace answer (requires moderation)" : "Write an answer"}
                  </label>
                  <textarea
                    id={`answer-${item.question_id}`}
                    value={drafts[item.question_id] ?? ""}
                    onChange={(event) => setDrafts((previous) => ({ ...previous, [item.question_id]: event.target.value }))}
                    minLength={2}
                    maxLength={5000}
                    rows={3}
                    required
                    className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                  />
                  <div className="mt-2 flex justify-end">
                    <button disabled={workingId === item.question_id} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                      {item.answer_id ? "Replace answer" : "Submit answer"}
                    </button>
                  </div>
                </form>
              )}
            </article>
          ))}
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
