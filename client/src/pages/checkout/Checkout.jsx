import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Lock, Loader2 } from "lucide-react";

import { useCart } from "../../context/CartContext";
import AddressSelector from "../../components/checkout/AddressSelector";
import PaymentMethodSelector from "../../components/checkout/PaymentMethodSelector";
import OrderSummary from "../../components/checkout/OrderSummary";
import ErrorMessage from "../../components/common/ErrorMessage";
import StorefrontSkeleton from "../../components/common/StorefrontSkeleton";

import { getAddresses } from "../../services/address.service";
import { getLoyaltyAccount } from "../../services/loyalty.service";
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
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loyaltyAccount, setLoyaltyAccount] = useState(null);
  const [loyaltyError, setLoyaltyError] = useState("");
  const [loyaltyAccountError, setLoyaltyAccountError] = useState("");

  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [method, setMethod] = useState("COD");
  const [placing, setPlacing] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // A ref closes the gap before React re-renders, so a double click
  // can never send two order requests.
  const placingRef = useRef(false);

  const items = cart?.items ?? [];

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;

    const updateKeyboardState = () => {
      const focusedFormControl = document.activeElement?.matches("input, textarea, select");
      setKeyboardOpen(Boolean(focusedFormControl && window.innerHeight - viewport.height > 120));
    };

    viewport.addEventListener("resize", updateKeyboardState);
    viewport.addEventListener("scroll", updateKeyboardState);
    document.addEventListener("focusin", updateKeyboardState);
    document.addEventListener("focusout", updateKeyboardState);
    updateKeyboardState();

    return () => {
      viewport.removeEventListener("resize", updateKeyboardState);
      viewport.removeEventListener("scroll", updateKeyboardState);
      document.removeEventListener("focusin", updateKeyboardState);
      document.removeEventListener("focusout", updateKeyboardState);
    };
  }, []);

  const loadPreview = useCallback(async (code = "", points = 0) => {
    setPreviewLoading(true);

    try {
      setPreview(await previewOrder(code, points));
      setCouponError("");
      setLoyaltyError("");
      return true;
    } catch (error) {
      if (code) {
        setCouponError(getErrorMessage(error));
        setCouponCode("");

        try {
          setPreview(await previewOrder("", 0));
        } catch (inner) {
          setSubmitError(getErrorMessage(inner));
        }
      } else if (points > 0) {
        setLoyaltyError(getErrorMessage(error));
        setLoyaltyPoints(0);
        try {
          setPreview(await previewOrder("", 0));
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
        try {
          setLoyaltyAccount(await getLoyaltyAccount());
        } catch (error) {
          setLoyaltyAccountError(getErrorMessage(error));
        }

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
    const ok = await loadPreview(code, 0);
    if (ok) {
      setLoyaltyPoints(0);
      setCouponCode(code.toUpperCase());
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponCode("");
    setLoyaltyPoints(0);
    await loadPreview("", 0);
  };

  const handleApplyPoints = async (points) => {
    setSubmitError("");
    const ok = await loadPreview("", points);
    if (ok) {
      setCouponCode("");
      setLoyaltyPoints(points);
    }
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
      order = await placeOrder({ addressId, couponCode, loyaltyPoints });
    } catch (error) {
      setSubmitError(getErrorMessage(error));
      placingRef.current = false;
      setPlacing(false);

      // Stock, prices or coupon may have changed: show fresh numbers.
      await refreshCart().catch(() => {});
      await loadPreview(couponCode, loyaltyPoints);
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
    return <StorefrontSkeleton label="Preparing checkout" layout="split" />;
  }

  if (loadError) {
    return (
      <div className="container-custom py-12">
        <ErrorMessage message={loadError} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="premium-page mx-auto max-w-7xl px-4 py-20 text-center">
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
    <div className="premium-page">
    <div className={`container-custom pt-8 lg:pb-12 ${keyboardOpen ? "pb-8" : "pb-32"}`}>
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-500">
        <Link to="/cart" className="hover:text-zinc-800">Cart</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-zinc-800">Checkout</span>
      </nav>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Checkout</h1>

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
            loyaltyAccount={loyaltyAccount}
            loyaltyAccountError={loyaltyAccountError}
            loyaltyPoints={loyaltyPoints}
            loyaltyError={loyaltyError}
            onApplyPoints={handleApplyPoints}
            onPlaceOrder={handlePlaceOrder}
            placing={placing}
            canPlace={canPlace}
            buttonLabel={buttonLabel}
          />
        </div>
      </div>

      {/* Mobile sticky action bar */}
      {!keyboardOpen && <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_18px_rgba(29,40,34,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-4">
          <div className="min-w-0">
            <p className="text-xs text-zinc-500">Total</p>
            <p className="text-lg font-bold text-zinc-900">{preview ? formatPrice(preview.total) : "—"}</p>
          </div>
          <button
            type="button"
            onClick={handlePlaceOrder}
            aria-label={buttonLabel}
            disabled={!canPlace || placing || previewLoading}
            className="ml-auto flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placing ? <><Loader2 className="animate-spin" size={18} /> Placing…</> : <><Lock size={16} /><span className="sm:hidden">Place order</span><span className="hidden sm:inline">{buttonLabel}</span></>}
          </button>
        </div>
      </div>}
    </div>
    </div>
  );
}
