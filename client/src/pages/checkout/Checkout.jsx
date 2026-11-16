import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Lock, Loader2 } from "lucide-react";

import { useCart } from "../../context/CartContext";
import AddressSelector from "../../components/checkout/AddressSelector";
import PaymentMethodSelector from "../../components/checkout/PaymentMethodSelector";
import OrderSummary from "../../components/checkout/OrderSummary";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";

import { getAddresses } from "../../services/address.service";
import { previewOrder, placeOrder } from "../../services/order.service";
import { payWithCod, startOnlinePayment } from "../../services/payment.service";
import { formatPrice } from "../../utils/product.utils";
import { getErrorMessage } from "../../utils/error.utils";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState(null);

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");

  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [method, setMethod] = useState("COD");
  const [placing, setPlacing] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // A ref closes the gap before React re-renders, so a double click
  // can never send two order requests.
  const placingRef = useRef(false);

  const items = cart?.items ?? [];

  const loadPreview = useCallback(async (code = "") => {
    setPreviewLoading(true);

    try {
      setPreview(await previewOrder(code));
      setCouponError("");
      return true;
    } catch (error) {
      if (code) {
        setCouponError(getErrorMessage(error));
        setCouponCode("");

        try {
          setPreview(await previewOrder(""));
        } catch (inner) {
          setSubmitError(getErrorMessage(inner));
        }
      } else {
        setPreview(null);
        setSubmitError(getErrorMessage(error));
      }
      return false;
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const loadAddresses = useCallback(async (preferredId) => {
    const list = await getAddresses();
    setAddresses(list);

    const preferred = list.find((a) => Number(a.address_id) === Number(preferredId));
    const fallback = list.find((a) => Number(a.is_default) === 1) ?? list[0];

    setAddressId((preferred ?? fallback)?.address_id ?? null);
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const freshCart = await refreshCart();
        await loadAddresses();

        const hasItems = (freshCart?.items ?? []).length > 0;
        if (active && hasItems) await loadPreview("");
      } catch (error) {
        if (active) setLoadError(getErrorMessage(error));
      } finally {
        if (active) setInitialLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [refreshCart, loadAddresses, loadPreview]);

  const handleApplyCoupon = async (code) => {
    setSubmitError("");
    const ok = await loadPreview(code);
    if (ok) setCouponCode(code.toUpperCase());
  };

  const handleRemoveCoupon = async () => {
    setCouponCode("");
    await loadPreview("");
  };

  const handlePlaceOrder = async () => {
    if (placingRef.current) return;

    if (!addressId) {
      setSubmitError("Please select or add a delivery address.");
      return;
    }

    placingRef.current = true;
    setPlacing(true);
    setSubmitError("");

    let order;

    try {
      order = await placeOrder({ addressId, couponCode });
    } catch (error) {
      setSubmitError(getErrorMessage(error));
      placingRef.current = false;
      setPlacing(false);

      // Stock, prices or coupon may have changed: show fresh numbers.
      await refreshCart().catch(() => {});
      await loadPreview(couponCode);
      return;
    }

    // The order exists and the server emptied the cart.
    refreshCart().catch(() => {});

    try {
      if (method === "COD") {
        await payWithCod(order.order_id);
        navigate(`/order-confirmation/${order.order_id}`, { replace: true });
      } else {
        const attempt = await startOnlinePayment(order.order_id);
        navigate(`/mock-payment/${attempt.attemptId}`, { replace: true });
      }
    } catch (error) {
      // Never leave the customer stranded: the confirmation page can retry payment.
      navigate(`/order-confirmation/${order.order_id}`, {
        replace: true,
        state: { paymentError: getErrorMessage(error) },
      });
    }
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <ErrorMessage message={loadError} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto text-zinc-400" size={48} />
        <h1 className="mt-5 text-2xl font-bold text-zinc-900">Your cart is empty</h1>
        <p className="mt-2 text-zinc-600">Add something to your cart before checking out.</p>
        <Link to="/products" className="mt-6 inline-flex rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700">
          Browse products
        </Link>
      </div>
    );
  }

  const buttonLabel = method === "COD" ? "Place order" : "Place order & pay online";
  const canPlace = Boolean(addressId) && Boolean(preview);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6 lg:px-8 lg:pb-12">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-500">
        <Link to="/cart" className="hover:text-zinc-800">Cart</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-zinc-800">Checkout</span>
      </nav>

      <h1 className="mt-3 text-2xl font-bold text-zinc-900 sm:text-3xl">Checkout</h1>

      {submitError && (
        <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="space-y-6 lg:col-span-2">
          <AddressSelector
            addresses={addresses}
            selectedId={addressId}
            onSelect={setAddressId}
            onChanged={(id) => loadAddresses(id)}
          />
          <PaymentMethodSelector value={method} onChange={setMethod} />
        </div>

        <div className="lg:sticky lg:top-24">
          <OrderSummary
            items={items}
            preview={preview}
            previewLoading={previewLoading}
            couponCode={couponCode}
            couponError={couponError}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            onPlaceOrder={handlePlaceOrder}
            placing={placing}
            canPlace={canPlace}
            buttonLabel={buttonLabel}
          />
        </div>
      </div>

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-4">
          <div className="min-w-0">
            <p className="text-xs text-zinc-500">Total</p>
            <p className="text-lg font-bold text-zinc-900">{preview ? formatPrice(preview.total) : "—"}</p>
          </div>
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={!canPlace || placing || previewLoading}
            className="ml-auto flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placing ? <><Loader2 className="animate-spin" size={18} /> Placing…</> : <><Lock size={16} /> {buttonLabel}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
