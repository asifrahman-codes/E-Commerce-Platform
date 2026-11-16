import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Trash2 } from "lucide-react";

import { useCart } from "../../context/CartContext";

import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function Cart() {
  const {
    cart,
    loading,
    error,
    refreshCart,
    updateCartItem,
    removeCartItem,
    clearCart,
  } = useCart();

  const [actionError, setActionError] = useState("");
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    refreshCart().catch(() => {});
  }, [refreshCart]);

  const handleClearCart = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove all items from your cart?"
    );

    if (!confirmed) return;

    try {
      setClearing(true);
      setActionError("");

      await clearCart();
    } catch (err) {
      setActionError(
        err.message ||
          "Unable to clear your cart."
      );
    } finally {
      setClearing(false);
    }
  };

  if (!localStorage.getItem("accessToken")) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto text-zinc-400" size={48} />

        <h1 className="mt-5 text-2xl font-bold text-zinc-900 dark:text-white">
          Sign in to view your cart
        </h1>

        <p className="mt-2 text-zinc-500">
          Please sign in to access your shopping cart.
        </p>

        <Link
          to="/login?redirect=/cart"
          className="mt-6 inline-flex rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (loading && cart.items.length === 0) {
    return <LoadingSpinner />;
  }

  if (error && cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <ErrorMessage message={error} />
        <button
          onClick={() => refreshCart().catch(() => {})}
          className="mt-4 rounded-lg bg-indigo-600 px-5 py-2 text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Shopping Cart
          </h1>

          <p className="mt-2 text-zinc-500">
            {cart.total_items} item(s) in your cart
          </p>
        </div>

        {cart.items.length > 0 && (
          <button
            type="button"
            onClick={handleClearCart}
            disabled={clearing}
            className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            <Trash2 size={16} />
            {clearing ? "Clearing..." : "Clear Cart"}
          </button>
        )}
      </div>

      {actionError && (
        <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {actionError}
        </div>
      )}

      {cart.items.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 px-6 py-16 text-center dark:border-zinc-800">
          <ShoppingBag
            size={52}
            className="mx-auto text-zinc-400"
          />

          <h2 className="mt-5 text-xl font-bold text-zinc-900 dark:text-white">
            Your cart is empty
          </h2>

          <p className="mt-2 text-zinc-500">
            Discover products and add your favorites to your cart.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-flex rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            {cart.items.map((item) => (
              <CartItem
                key={item.cart_item_id}
                item={item}
                onUpdate={updateCartItem}
                onRemove={removeCartItem}
              />
            ))}
          </section>

          <aside>
            <CartSummary cart={cart} />
          </aside>
        </div>
      )}
    </main>
  );
}