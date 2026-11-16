
import { AlertTriangle, X } from "lucide-react";

const CancelOrderModal = ({
  open,
  onClose,
  onConfirm,
  loading,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="rounded-full bg-red-100 p-3 text-red-600">
            <AlertTriangle size={24} />
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-700 disabled:opacity-40"
            aria-label="Close dialog"
          >
            <X size={21} />
          </button>
        </div>

        <h2 className="mt-5 text-xl font-bold text-gray-900">
          Cancel this order?
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Are you sure you want to cancel this order?
          This action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Keep Order
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Cancelling..." : "Yes, Cancel Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
