
import { Package } from "lucide-react";
import { formatCurrency } from "../../utils/order.utils";

const OrderItems = ({ items = [] }) => {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        No order items found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="font-semibold text-gray-900">
          Order Items ({items.length})
        </h2>
      </div>

      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <div
            key={item.order_item_id}
            className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                <Package size={22} />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  {item.product_name}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  SKU: {item.sku || "N/A"}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Variant ID: {item.variant_id}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 sm:text-right">
              <div>
                <p className="text-xs text-gray-500">
                  Quantity
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {item.quantity}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Total
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {formatCurrency(item.total_price)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderItems;
