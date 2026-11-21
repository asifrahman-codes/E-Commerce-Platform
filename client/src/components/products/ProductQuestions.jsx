import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  askProductQuestion,
  getProductQuestions,
  markAnswerUseful,
  unmarkAnswerUseful,
} from "../../services/product-qa.service";

const PAGE_SIZE = 10;

export default function ProductQuestions({ productId }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [result, setResult] = useState(null);
  const [question, setQuestion] = useState("");
  const [page, setPage] = useState(1);
  const [usefulAnswers, setUsefulAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setResult(await getProductQuestions(productId, { page, limit: PAGE_SIZE }));
    } catch (loadError) {
      setError(loadError?.message || "Unable to load product questions.");
    } finally {
      setLoading(false);
    }
  }, [productId, page]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  const submitQuestion = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/products/${productId}#questions`)}`);
      return;
    }
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      await askProductQuestion(productId, question);
      setQuestion("");
      setMessage("Your question was submitted for moderation.");
    } catch (submitError) {
      setError(submitError?.message || "Unable to submit your question.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUseful = async (answerId) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/products/${productId}#questions`)}`);
      return;
    }
    const marked = Boolean(usefulAnswers[answerId]);
    setError("");
    try {
      const update = marked
        ? await unmarkAnswerUseful(answerId)
        : await markAnswerUseful(answerId);
      setUsefulAnswers((previous) => ({
        ...previous,
        [answerId]: update.is_useful,
      }));
      setResult((previous) => ({
        ...previous,
        questions: previous.questions.map((item) =>
          Number(item.answer_id) === Number(answerId)
            ? { ...item, useful_count: update.useful_count }
            : item
        ),
      }));
    } catch (voteError) {
      setError(voteError?.message || "Unable to update this answer.");
    }
  };

  const questions = result?.questions ?? [];
  const pagination = result?.pagination ?? {};

  return (
    <section id="questions" className="mt-12 border-t border-zinc-200 pt-10">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Product help</p>
        <h2 className="mt-1 text-2xl font-bold text-zinc-900">Questions &amp; answers</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Questions and answers appear publicly after moderation. Do not include personal contact information.
        </p>
      </header>

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}

      <form onSubmit={submitQuestion} className="mb-8 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
        <label htmlFor="product-question" className="block text-sm font-semibold text-zinc-800">
          Ask about this product
        </label>
        <textarea
          id="product-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          minLength={5}
          maxLength={2000}
          rows={3}
          required
          placeholder="What would you like to know?"
          className="mt-3 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-zinc-500">{question.length}/2000 characters</span>
          <button
            type="submit"
            disabled={submitting || question.trim().length < 5}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit question"}
          </button>
        </div>
      </form>

      <div aria-live="polite">
        {loading ? (
          <p className="py-8 text-center text-sm text-zinc-500">Loading questions…</p>
        ) : questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center">
            <h3 className="font-semibold text-zinc-800">No questions yet</h3>
            <p className="mt-1 text-sm text-zinc-500">Be the first to ask about this product.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((item) => (
              <article key={item.question_id} className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                <p className="font-medium leading-6 text-zinc-900">{item.question_text}</p>
                <time dateTime={item.created_at} className="mt-2 block text-xs text-zinc-400">
                  Asked {new Date(item.created_at).toLocaleDateString()}
                </time>
                {item.answer_text ? (
                  <div className="mt-4 rounded-xl bg-zinc-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">ShopSphere answer</p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-700">{item.answer_text}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <time dateTime={item.answered_at} className="text-xs text-zinc-400">
                        Answered {new Date(item.answered_at).toLocaleDateString()}
                      </time>
                      <button
                        type="button"
                        onClick={() => void toggleUseful(item.answer_id)}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                      >
                        {usefulAnswers[item.answer_id] ? "Marked useful" : "Useful"} · {Number(item.useful_count || 0)}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-zinc-500">This question has not been answered yet.</p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {pagination.total_pages > 1 && (
        <nav aria-label="Product question pages" className="mt-6 flex items-center justify-between">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-zinc-500">Page {pagination.page} of {pagination.total_pages}</span>
          <button
            type="button"
            disabled={page >= pagination.total_pages || loading}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      )}
    </section>
  );
}
