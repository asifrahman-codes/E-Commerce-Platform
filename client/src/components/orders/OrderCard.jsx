
import { Link } from "react-router-dom";
import { ArrowRight, Package } from "lucide-react";

import OrderStatusBadge from "./OrderStatusBadge";
import {
  formatCurrency,
  formatDate,
} from "../../utils/order.utils";

const OrderCard = ({ order }) => {
  return (
    <div className="shop-panel p-5 transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="shop-eyebrow">
            Order Number
          </p>

          <h3 className="mt-1 font-semibold text-ink">
            {order.order_number}
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>

        <OrderStatusBadge status={order.status} />
      </div>

      <div className="my-5 grid grid-cols-2 gap-4 border-y border-line py-4">
        <div>
          <p className="text-xs text-gray-500">Order Total</p>

          <p className="mt-1 font-semibold text-ink">
            {formatCurrency(order.total)}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Payment Status</p>

          <p className="mt-1 font-semibold text-ink">
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
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
        >
          View Details
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default OrderCard;
