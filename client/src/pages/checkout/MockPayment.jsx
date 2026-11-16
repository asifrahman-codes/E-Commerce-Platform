import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CreditCard, Loader2, FlaskConical } from "lucide-react";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { getOnlineAttempt, completeMockPayment } from "../../services/payment.service";
import { formatPrice } from "../../utils/product.utils";
import { getErrorMessage } from "../../utils/error.utils";

// Test page for the existing mock gateway (the backend rejects it in production).
export default function MockPayment() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    let active = true;

    getOnlineAttempt(attemptId)
      .then((data) => active && setAttempt(data))
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [attemptId]);

  const finish = async (status) => {
    if (busy) return;
    setBusy(status);
    setError("");

    try {
      await completeMockPayment(attemptId, status);
      navigate(`/order-confirmation/${attempt.order_id}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy("");
    }
  };

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  if (!attempt) {
    return <div className="mx-auto max-w-lg px-4 py-12"><ErrorMessage message={error || "Payment not found."} /></div>;
  }

  const open = ["INITIATED", "PENDING"].includes(attempt.status);

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
          <FlaskConical size={14} /> Test payment gateway — no real money moves
        </p>

        <h1 className="mt-4 flex items-center gap-2 text-xl font-bold text-zinc-900"><CreditCard size={22} /> Complete your payment</h1>
        <p className="mt-3 text-3xl font-bold text-zinc-900">{formatPrice(attempt.amount)}</p>
        <p className="mt-1 text-sm text-zinc-500">Order #{attempt.order_id}</p>

        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        {open ? (
          <div className="mt-6 space-y-3">
            <button type="button" disabled={Boolean(busy)} onClick={() => finish("SUCCEEDED")} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
              {busy === "SUCCEEDED" && <Loader2 className="animate-spin" size={18} />} Simulate successful payment
            </button>
            <button type="button" disabled={Boolean(busy)} onClick={() => finish("FAILED")} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">
              {busy === "FAILED" && <Loader2 className="animate-spin" size={18} />} Simulate failed payment
            </button>
            <button type="button" disabled={Boolean(busy)} onClick={() => finish("CANCELLED")} className="w-full rounded-xl px-5 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-60">
              Cancel payment
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-sm text-zinc-600">This payment is already {attempt.status.toLowerCase()}.</p>
            <button type="button" onClick={() => navigate(`/order-confirmation/${attempt.order_id}`, { replace: true })} className="mt-4 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700">
              View order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
