import { useState } from "react";
import { X, AlertTriangle, Loader2, Eye, EyeOff } from "lucide-react";

import { deactivateMyAccount } from "../../services/account.service";

export default function DeactivateAccountModal({ onClose, onDeactivated }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const canSubmit = confirmText === "DEACTIVATE" && password.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmit) return;

    try {
      setLoading(true);
      setError("");

      await deactivateMyAccount({ password });

      onDeactivated?.();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to deactivate account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-full bg-red-100 p-2">
            <AlertTriangle size={20} className="text-red-600" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-zinc-900">
              Deactivate Account
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              This action will disable your account. You will be logged out
              and unable to sign in until an administrator reactivates your account.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Type <span className="font-mono font-bold text-red-600">DEACTIVATE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              placeholder="DEACTIVATE"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Enter your password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 pr-12 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                placeholder="Your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Deactivating..." : "Deactivate Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
