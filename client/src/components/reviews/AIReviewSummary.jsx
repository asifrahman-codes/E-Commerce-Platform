import { useEffect, useState } from "react";
import { AlertCircle, Bot, CheckCircle2, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import { getAIReviewSummary } from "../../services/review.service";

function Skeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
      <div className="h-5 w-48 rounded bg-indigo-100" />
      <div className="mt-4 h-4 w-full rounded bg-indigo-100" />
      <div className="mt-2 h-4 w-3/4 rounded bg-indigo-100" />
    </div>
  );
}

export default function AIReviewSummary({ productId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setData(await getAIReviewSummary(productId));
    } catch (loadError) {
      setError(loadError?.message || "Unable to generate the AI review summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) void load();
  }, [productId]);

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle size={18} /> AI summary unavailable
        </div>
        <p>{error}</p>
        <button
          type="button"
          onClick={load}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 font-semibold"
        >
          <RotateCcw size={15} /> Retry
        </button>
      </div>
    );
  }

  const summary = data?.ai_summary;
  const statistics = data?.statistics;

  if (!summary) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
          <Bot size={18} className="text-indigo-600" /> AI review summary
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          {data?.message || "Not enough approved reviews to generate a reliable summary."}
        </p>
      </div>
    );
  }

  const sentiment = String(summary.sentiment || "mixed");
  const sentimentLabel = sentiment.charAt(0).toUpperCase() + sentiment.slice(1);

  return (
    <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-white p-5" aria-label="AI-generated review summary">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 font-semibold text-zinc-900">
            <Bot size={19} className="text-indigo-600" /> AI review summary
          </div>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-indigo-600">AI-generated content</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200">
          {statistics?.total_reviews ?? 0} reviews analyzed · {sentimentLabel} sentiment
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-zinc-700">{summary.summary}</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <ThumbsUp size={16} /> Pros
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm text-zinc-700">
            {(summary.pros?.length ? summary.pros : summary.frequent_advantages || []).map((item, index) => (
              <li key={index} className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-red-700">
            <ThumbsDown size={16} /> Cons & complaints
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm text-zinc-700">
            {[...(summary.cons || []), ...(summary.common_complaints || [])].slice(0, 8).map((item, index) => (
              <li key={index} className="flex gap-2"><AlertCircle size={15} className="mt-0.5 shrink-0 text-red-400" />{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {summary.verdict && <p className="mt-5 border-t border-indigo-100 pt-4 text-sm font-medium text-zinc-800">{summary.verdict}</p>}
    </section>
  );
}
