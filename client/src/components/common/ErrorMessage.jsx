import { AlertCircle, RefreshCw } from "lucide-react";

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">

      <AlertCircle size={35} className="text-red-500" />

      <h3 className="mt-4 font-semibold text-gray-900">
        Something went wrong
      </h3>

      <p className="mt-2 max-w-md text-sm text-gray-500">
        {message || "Unable to load information."}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      )}

    </div>
  );
};

export default ErrorMessage;