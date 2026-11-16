import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  RefreshCw,
  CalendarDays,
  Receipt,
} from "lucide-react";

import {
  getOrder,
  cancelOrder,
  getOrderShipments,
} from "../../services/order.service";

import OrderStatusBadge from "../../components/orders/OrderStatusBadge";
import OrderItems from "../../components/orders/OrderItems";
import OrderTimeline from "../../components/orders/OrderTimeline";
import CancelOrderModal from "../../components/orders/CancelOrderModal";
import ShipmentTracking from "../../components/orders/ShipmentTracking";

import {
  canCancelOrder,
  formatCurrency,
  formatDate,
  getOrderErrorMessage,
} from "../../utils/order.utils";

const OrderDetails = () => {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const [shipments, setShipments] = useState([]);
  const [shipmentLoading, setShipmentLoading] = useState(true);
  const [shipmentError, setShipmentError] = useState("");

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOrder(orderId);

      const orderData = response?.data ?? response;

      if (
        !orderData ||
        typeof orderData !== "object" ||
        Array.isArray(orderData)
      ) {
        throw new Error("Invalid order response from server.");
      }

      setOrder(orderData);
    } catch (err) {
      setError(getOrderErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const fetchShipments = useCallback(async () => {
    try {
      setShipmentLoading(true);
      setShipmentError("");

      const response = await getOrderShipments(orderId);

      const shipmentData =
        response?.data?.data ??
        response?.data ??
        response;

      if (!Array.isArray(shipmentData)) {
        throw new Error("Invalid shipment response from server.");
      }

      setShipments(shipmentData);
    } catch (err) {
      setShipmentError(
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load shipment information."
      );
    } finally {
      setShipmentLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const handleCancelOrder = async () => {
    try {
      setCancelLoading(true);
      setCancelError("");

      await cancelOrder(orderId);

      setCancelModalOpen(false);

      // Fetch again because cancellation response does not
      // include the address and payment information.
      await fetchOrder();
    } catch (err) {
      setCancelError(getOrderErrorMessage(err));
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

          <p className="mt-4 text-sm text-gray-500">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Unable to load order
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          {error || "Order not found."}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={fetchOrder}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <RefreshCw size={16} />
            Retry
          </button>

          <Link
            to="/orders"
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700"
          >
            My Orders
          </Link>
        </div>
      </div>
    );
  }

  const address = order.address || {};
  const payment = order.payment || {};

  const addressLines = [
    address.street,
    address.address_line_2,
    address.city,
    address.state,
    address.postal_code,
    address.country,
  ].filter(Boolean);

  const paymentMethod =
    payment.payment_method ||
    payment.method ||
    payment.payment_type ||
    "N/A";

  const paymentReference =
    payment.transaction_id ||
    payment.reference ||
    payment.payment_reference;

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/orders"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600"
        >
          <ArrowLeft size={17} />
          Back to My Orders
        </Link>

        {/* Order header */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-gray-500">
                Order Number
              </p>

              <h1 className="mt-1 text-2xl font-bold text-gray-900">
                {order.order_number}
              </h1>

              <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <CalendarDays size={16} />
                {formatDate(order.created_at)}
              </p>
            </div>

            <OrderStatusBadge status={order.status} />
          </div>

          {canCancelOrder(order.status) && (
            <div className="mt-6 border-t border-gray-100 pt-5">
              <button
                type="button"
                onClick={() => {
                  setCancelError("");
                  setCancelModalOpen(true);
                }}
                className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Cancel Order
              </button>
            </div>
          )}

          {cancelError && (
            <p className="mt-3 text-sm text-red-600">
              {cancelError}
            </p>
          )}
        </div>

        {/* Order status */}
        <div className="mt-6">
          <OrderTimeline status={order.status} />
        </div>

        {/* Shipment tracking */}
        <div className="mt-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Shipment Tracking
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Follow the shipping progress of your order.
            </p>
          </div>

          {shipmentLoading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

              <p className="mt-3 text-sm text-gray-500">
                Loading shipment information...
              </p>
            </div>
          ) : shipmentError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="text-sm text-red-700">
                {shipmentError}
              </p>

              <button
                type="button"
                onClick={fetchShipments}
                className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <ShipmentTracking shipments={shipments} />
          )}
        </div>

        {/* Items and summary */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <OrderItems items={order.items || []} />

            {/* Delivery address */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <MapPin className="text-indigo-600" size={20} />

                <h2 className="font-semibold text-gray-900">
                  Delivery Address
                </h2>
              </div>

              {addressLines.length > 0 ? (
                <div className="mt-4 space-y-1 text-sm text-gray-600">
                  {addressLines.map((line, index) => (
                    <p key={`${line}-${index}`}>
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  Address information is unavailable.
                </p>
              )}
            </div>

            {/* Payment information */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <CreditCard className="text-indigo-600" size={20} />

                <h2 className="font-semibold text-gray-900">
                  Payment Information
                </h2>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">
                    Payment Method
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {paymentMethod}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Payment Status
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {order.payment_status || "N/A"}
                  </p>
                </div>

                {paymentReference && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500">
                      Payment Reference
                    </p>

                    <p className="mt-1 break-all text-sm font-medium text-gray-900">
                      {paymentReference}
                    </p>
                  </div>
                )}

                {!order.payment && (
                  <p className="text-sm text-gray-500 sm:col-span-2">
                    No payment record is currently available.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing summary */}
          <div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Receipt size={20} className="text-indigo-600" />

                <h2 className="font-semibold text-gray-900">
                  Order Summary
                </h2>
              </div>

              <div className="mt-5 space-y-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Subtotal</span>

                  <span className="font-medium text-gray-900">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Discount</span>

                  <span className="font-medium text-green-600">
                    -{formatCurrency(order.discount)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Shipping</span>

                  <span className="font-medium text-gray-900">
                    {formatCurrency(order.shipping)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Tax</span>

                  <span className="font-medium text-gray-900">
                    {formatCurrency(order.tax)}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between gap-3">
                    <span className="font-semibold text-gray-900">
                      Total
                    </span>

                    <span className="text-lg font-bold text-indigo-600">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">
                  Order ID
                </p>

                <p className="mt-1 break-all text-sm font-medium text-gray-800">
                  {order.order_id}
                </p>
              </div>
            </div>
          </div>
        </div>

        <CancelOrderModal
          open={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          onConfirm={handleCancelOrder}
          loading={cancelLoading}
        />
      </div>
    </section>
  );
};

export default OrderDetails;