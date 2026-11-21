import { useState, useEffect, useRef } from "react";
import { X, Loader2, Save } from "lucide-react";
import useDialogFocus from "../../hooks/useDialogFocus";

export default function AddressForm({ address, onSubmit, onClose, loading }) {
  const [form, setForm] = useState({
    street: "",
    city: "",
    postal_code: "",
    country: "",
    is_default: false,
  });

  const [error, setError] = useState("");
  const dialogRef = useRef(null);
  useDialogFocus(dialogRef, true, onClose);

  useEffect(() => {
    if (address) {
      setForm({
        street: address.street || "",
        city: address.city || "",
        postal_code: address.postal_code || "",
        country: address.country || "",
        is_default: Number(address.is_default) === 1,
      });
    }
  }, [address]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.street.trim() || !form.city.trim() || !form.country.trim()) {
      setError("Street, city, and country are required.");
      return;
    }

    try {
      setError("");
      await onSubmit(form);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save address."
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-address-title"
      tabIndex={-1}
      ref={dialogRef}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >

      <div className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-h-[92vh] sm:max-w-lg sm:rounded-2xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 id="account-address-title" className="text-lg font-bold text-zinc-900">
            {address ? "Edit Address" : "Add New Address"}
          </h3>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close address form"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Street Address
            </label>
            <input
              type="text"
              name="street"
              value={form.street}
              onChange={handleChange}
              autoComplete="street-address"
              className="min-h-11 w-full rounded-xl border border-zinc-200 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
              placeholder="123 Main Street, Apt 4B"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                City
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                autoComplete="address-level2"
                className="min-h-11 w-full rounded-xl border border-zinc-200 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
                placeholder="City"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Postal Code
              </label>
              <input
                type="text"
                name="postal_code"
                value={form.postal_code}
                onChange={handleChange}
                autoComplete="postal-code"
                className="min-h-11 w-full rounded-xl border border-zinc-200 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
                placeholder="12345"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={form.country}
              onChange={handleChange}
              autoComplete="country-name"
              className="min-h-11 w-full rounded-xl border border-zinc-200 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
              placeholder="Country"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-600">
            <input
              type="checkbox"
              name="is_default"
              checked={form.is_default}
              onChange={handleChange}
              className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
            />
            Set as default address
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {loading ? "Saving..." : address ? "Update" : "Add Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
