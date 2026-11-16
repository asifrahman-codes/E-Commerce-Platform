import { getOrderStatusLabel } from "../../utils/order.utils";

const statusStyles = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const OrderStatusBadge = ({ status }) => {
  const styles =
    statusStyles[status] || "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles}`}
    >
      {getOrderStatusLabel(status)}
    </span>
  );
};

export default OrderStatusBadge;
