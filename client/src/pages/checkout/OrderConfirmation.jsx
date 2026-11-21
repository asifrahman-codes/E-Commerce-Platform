import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Clock, AlertTriangle, Loader2, MapPin, CreditCard } from "lucide-react";

import ErrorMessage from "../../components/common/ErrorMessage";
import StorefrontSkeleton from "../../components/common/StorefrontSkeleton";
import { getOrder } from "../../services/order.service";
import { payWithCod, startOnlinePayment } from "../../services/payment.service";
import { formatPrice } from "../../utils/product.utils";
import { getErrorMessage } from "../../utils/error.utils";

const formatDate = (value) =>
  value ? new Date(value).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" }) : "";

const label = (value = "") => value.charAt(0) + value.slice(1).toLowerCase();

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState(location.state?.paymentError || "");

  const load = useCallback(async () => {
    try {
      setError("");
      setOrder(await getOrder(orderId));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const retry = async (kind) => {
    if (paying) return;
    setPaying(true);
    setPaymentError("");

    try {
      if (kind === "COD") {
        await payWithCod(orderId);
        await load();
      } else {
        const attempt = await startOnlinePayment(orderId);
        navigate(`/mock-payment/${attempt.attemptId}`);
      }
    } catch (err) {
      setPaymentError(getErrorMessage(err));
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <StorefrontSkeleton label="Loading order confirmation" layout="split" />;
  }

  if (error || !order) {
    return <div className="mx-auto max-w-3xl px-4 py-12"><ErrorMessage message={error || "Order not found."} onRetry={load} /></div>;
  }

  const isCod = order.payment?.payment_gateway === "COD";
  const paid = order.payment_status === "PAID";
  const cancelled = order.status === "CANCELLED";
  const needsPayment = !paid && !cancelled && !isCod && ["PENDING", "FAILED"].includes(order.payment_status);

  const heading = cancelled ? "Order cancelled" : needsPayment ? "Order placed — payment needed" : "Thank you, your order is placed!";
  const Icon = cancelled || needsPayment ? (needsPayment ? Clock : AlertTriangle) : CheckCircle2;
  const iconColor = cancelled ? "text-red-500" : needsPayment ? "text-amber-500" : "text-emerald-500";

  return (
    <div className="shop-page">
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="rounded-[2rem] bg-[#e9ede5] px-5 py-10 text-center sm:px-8 sm:py-12">
        <Icon className={`mx-auto ${iconColor}`} size={52} aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold text-zinc-900 sm:text-3xl">{heading}</h1>
        <p className="mt-2 text-zinc-600">
          Order <span className="font-semibold text-zinc-900">{order.order_number}</span> · {formatDate(order.created_at)}
        </p>
      </div>

      {paymentError && (
        <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {paymentError}
        </p>
      )}

      {needsPayment && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-900">
            {order.payment_status === "FAILED"
              ? "Your online payment did not go through. Your items are reserved — choose how you would like to pay."
              : "We have your order, but no payment has been started yet. Choose how you would like to pay."}
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button type="button" disabled={paying} onClick={() => retry("ONLINE")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
              {paying ? <Loader2 className="animate-spin" size={16} /> : <CreditCard size={16} />} Pay online
            </button>
            <button type="button" disabled={paying} onClick={() => retry("COD")} className="rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-60">
              Pay cash on delivery
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <section className="shop-panel p-5 sm:p-6 md:col-span-2" aria-labelledby="items-heading">
          <h2 id="items-heading" className="text-lg font-bold text-zinc-900">Items</h2>
          <ul className="mt-3 divide-y divide-zinc-100">
            {order.items?.map((item) => (
              <li key={item.order_item_id} className="flex justify-between gap-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900">{item.product_name}</p>
                  <p className="text-xs text-zinc-500">{item.sku} · {formatPrice(item.unit_price)} × {item.quantity}</p>
                </div>
                <p className="font-medium text-zinc-900">{formatPrice(item.total_price)}</p>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-zinc-200 pt-4 text-sm">
            <Line label="Subtotal" value={formatPrice(order.subtotal)} />
            {Number(order.discount) > 0 && <Line label="Discount" value={`− ${formatPrice(order.discount)}`} />}
            <Line label="Shipping" value={Number(order.shipping) === 0 ? "Free" : formatPrice(order.shipping)} />
            {Number(order.tax) > 0 && <Line label="Tax" value={formatPrice(order.tax)} />}
            <div className="flex justify-between border-t border-zinc-200 pt-3 text-base font-bold text-zinc-900">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </section>

        <div className="space-y-6">
          <section className="shop-panel p-5 text-sm" aria-labelledby="status-heading">
            <h2 id="status-heading" className="text-lg font-bold text-zinc-900">Status</h2>
            <dl className="mt-3 space-y-2">
              <Line label="Order" value={label(order.status)} />
              <Line label="Payment" value={label(order.payment_status)} />
              <Line label="Method" value={isCod ? "Cash on delivery" : paid ? "Paid online" : "Not selected"} />
            </dl>
          </section>

          {order.address && (
            <section className="shop-panel p-5 text-sm text-zinc-700" aria-labelledby="ship-heading">
              <h2 id="ship-heading" className="flex items-center gap-2 text-lg font-bold text-zinc-900"><MapPin size={18} /> Delivery to</h2>
              <p className="mt-3 font-medium text-zinc-900">{order.address.street}</p>
              <p>{order.address.city}{order.address.postal_code ? `, ${order.address.postal_code}` : ""}</p>
              <p>{order.address.country}</p>
            </section>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Link to="/products" className="shop-button shop-button-primary">
          Continue shopping
        </Link>
      </div>
    </div>
    </div>
  );
}

function Line({ label, value }) {
  return (
    <div className="flex justify-between">
      <dt className="text-zinc-600">{label}</dt>
      <dd className="font-medium text-zinc-900">{value}</dd>
    </div>
  );
}
