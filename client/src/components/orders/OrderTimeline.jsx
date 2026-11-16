
import {
  CheckCircle2,
  Circle,
  XCircle,
} from "lucide-react";

const stages = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

const labels = {
  PENDING: "Order Placed",
  CONFIRMED: "Order Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
};

const OrderTimeline = ({ status }) => {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-center gap-3 text-red-700">
          <XCircle size={24} />

          <div>
            <h3 className="font-semibold">
              Order Cancelled
            </h3>

            <p className="mt-1 text-sm">
              This order is no longer active.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = stages.indexOf(status);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-6 font-semibold text-gray-900">
        Order Status
      </h2>

      <div className="space-y-5">
        {stages.map((stage, index) => {
          const completed =
            currentIndex !== -1 && index <= currentIndex;

          const current = stage === status;

          return (
            <div key={stage} className="flex gap-3">
              <div className="flex flex-col items-center">
                {completed ? (
                  <CheckCircle2
                    size={21}
                    className="text-green-600"
                  />
                ) : (
                  <Circle
                    size={21}
                    className="text-gray-300"
                  />
                )}

                {index !== stages.length - 1 && (
                  <div
                    className={`mt-1 h-7 w-0.5 ${
                      completed
                        ? "bg-green-500"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>

              <div className="-mt-0.5">
                <p
                  className={`text-sm font-medium ${
                    current
                      ? "text-indigo-700"
                      : completed
                        ? "text-gray-900"
                        : "text-gray-400"
                  }`}
                >
                  {labels[stage]}
                </p>

                {current && (
                  <p className="mt-1 text-xs text-indigo-600">
                    Current status
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {currentIndex === -1 && (
        <p className="mt-4 text-xs text-gray-500">
          Current backend status: {status || "Unknown"}
        </p>
      )}
    </div>
  );
};

export default OrderTimeline;
