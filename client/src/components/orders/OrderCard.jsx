
import { Link } from "react-router-dom";
import { ArrowRight, Package } from "lucide-react";

import OrderStatusBadge from "./OrderStatusBadge";
import {
  formatCurrency,
  formatDate,
} from "../../utils/order.utils";

const OrderCard = ({ order }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Order Number
          </p>

          <h3 className="mt-1 font-semibold text-gray-900">
            {order.order_number}
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>

        <OrderStatusBadge status={order.status} />
      </div>

      <div className="my-5 grid grid-cols-2 gap-4 border-y border-gray-100 py-4">
        <div>
          <p className="text-xs text-gray-500">Order Total</p>

          <p className="mt-1 font-semibold text-gray-900">
            {formatCurrency(order.total)}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Payment Status</p>

          <p className="mt-1 font-semibold text-gray-900">
            {order.payment_status || "N/A"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Package size={17} />

          <span>
            Order #{order.order_id}
          </span>
        </div>

        <Link
          to={`/orders/${order.order_id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
          View Details
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default OrderCard;
