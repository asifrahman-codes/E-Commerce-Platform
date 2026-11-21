import { useCallback, useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Package,
    User,
    CreditCard,
    MapPin,
    RefreshCw
} from "lucide-react";

import adminOrderService from "../../services/admin-order.service";

import OrderStatusBadge from "../../components/admin/orders/OrderStatusBadge";

import OrderItemsTable from "../../components/admin/orders/OrderItemsTable";

import ShipmentForm from "../../components/admin/orders/ShipmentForm";

import ShipmentTracking from "../../components/admin/orders/ShipmentTracking";


const formatPrice = (value) => {

    return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        maximumFractionDigits: 2
    }).format(Number(value || 0));

};


const formatDate = (value) => {

    if (!value) return "—";

    return new Date(value).toLocaleString("en-PK", {
        dateStyle: "medium",
        timeStyle: "short"
    });

};


export default function AdminOrderDetails() {

    const { orderId } = useParams();

    const [order, setOrder] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    const loadOrder = useCallback(async () => {

        try {

            setLoading(true);
            setError("");

            const data = await adminOrderService.getOrderById(
                orderId
            );

            setOrder(data);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to load order details."
            );

        } finally {

            setLoading(false);

        }

    }, [orderId]);


    useEffect(() => {

        loadOrder();

    }, [loadOrder]);


    if (loading) {

        return (

            <div className="flex min-h-[60vh] items-center justify-center">

                <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600" />

            </div>

        );

    }


    if (error || !order) {

        return (

            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

                <h2 className="font-semibold text-red-700">
                    Unable to load order
                </h2>

                <p className="mt-2 text-sm text-red-600">
                    {error || "Order not found."}
                </p>

                <Link
                    to="/admin/orders"
                    className="mt-4 inline-block font-semibold text-indigo-600"
                >
                    Back to orders
                </Link>

            </div>

        );

    }


    const shipments = order.shipments || [];

    const orderItems = order.items || [];


    return (

        <div className="space-y-6">

            {/* Header */}

            <div className="flex flex-wrap items-center justify-between gap-4">

                <div>

                    <Link
                        to="/admin/orders"
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-indigo-600"
                    >
                        <ArrowLeft size={16} />
                        Back to Orders
                    </Link>

                    <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
                        Order Details
                    </h1>

                    <p className="mt-2 text-sm text-zinc-500">
                        {order.order_number}
                    </p>

                </div>

                <button
                    type="button"
                    onClick={loadOrder}
                    className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-zinc-50"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>

            </div>


            {/* Order statuses */}

            <section className="flex flex-wrap gap-3 rounded-2xl border border-zinc-200 bg-white p-5">

                <div>

                    <p className="mb-2 text-xs uppercase text-zinc-500">
                        Order status
                    </p>

                    <OrderStatusBadge status={order.status} />

                </div>

                <div className="ml-5">

                    <p className="mb-2 text-xs uppercase text-zinc-500">
                        Payment status
                    </p>

                    <OrderStatusBadge status={order.payment_status} />

                </div>

                <div className="ml-auto">

                    <p className="mb-2 text-xs uppercase text-zinc-500">
                        Order date
                    </p>

                    <p className="text-sm font-semibold text-zinc-800">
                        {formatDate(order.created_at)}
                    </p>

                </div>

            </section>


            {/* Customer and payment */}

            <section className="grid gap-5 lg:grid-cols-2">

                <div className="rounded-2xl border border-zinc-200 bg-white p-5">

                    <div className="flex items-center gap-3">

                        <User className="text-indigo-600" />

                        <h2 className="font-semibold text-zinc-900">
                            Customer Information
                        </h2>

                    </div>

                    <div className="mt-5 space-y-3 text-sm">

                        <p>
                            <span className="text-zinc-500">
                                Name:{" "}
                            </span>

                            <span className="font-medium">
                                {order.first_name} {order.last_name}
                            </span>
                        </p>

                        <p>
                            <span className="text-zinc-500">
                                Email:{" "}
                            </span>

                            {order.email}
                        </p>

                        <p>
                            <span className="text-zinc-500">
                                Customer ID:{" "}
                            </span>

                            {order.user_id}
                        </p>

                    </div>

                </div>


                <div className="rounded-2xl border border-zinc-200 bg-white p-5">

                    <div className="flex items-center gap-3">

                        <CreditCard className="text-indigo-600" />

                        <h2 className="font-semibold text-zinc-900">
                            Payment Information
                        </h2>

                    </div>

                    <div className="mt-5 space-y-3 text-sm">

                        <p>
                            <span className="text-zinc-500">
                                Payment status:{" "}
                            </span>

                            <OrderStatusBadge status={order.payment_status} />
                        </p>

                        <p>
                            <span className="text-zinc-500">
                                Order ID:{" "}
                            </span>

                            {order.order_id}
                        </p>

                        <p>
                            <span className="text-zinc-500">
                                Payment method:{" "}
                            </span>

                            {order.payment_method || "Not available"}
                        </p>

                    </div>

                </div>

            </section>


            {/* Products */}

            <OrderItemsTable items={orderItems} />


            {/* Pricing */}

            <section className="rounded-2xl border border-zinc-200 bg-white p-5">

                <h2 className="font-semibold text-zinc-900">
                    Order Summary
                </h2>

                <div className="mt-5 max-w-md space-y-3 text-sm">

                    <div className="flex justify-between">
                        <span className="text-zinc-500">Subtotal</span>
                        <span>{formatPrice(order.subtotal)}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-zinc-500">Discount</span>
                        <span className="text-emerald-600">
                            -{formatPrice(order.discount)}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-zinc-500">Shipping</span>
                        <span>{formatPrice(order.shipping)}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-zinc-500">Tax</span>
                        <span>{formatPrice(order.tax)}</span>
                    </div>

                    <div className="flex justify-between border-t border-zinc-200 pt-4 text-lg font-bold">
                        <span>Total</span>
                        <span>{formatPrice(order.total)}</span>
                    </div>

                </div>

            </section>


            {/* Delivery address */}

            <section className="rounded-2xl border border-zinc-200 bg-white p-5">

                <div className="flex items-center gap-3">

                    <MapPin className="text-indigo-600" />

                    <h2 className="font-semibold text-zinc-900">
                        Delivery Address
                    </h2>

                </div>

                <div className="mt-4 text-sm leading-7 text-zinc-600">

                    <p>
                        {order.shipping_address ||
                            order.address_snapshot ||
                            "Address snapshot not available in this response."}
                    </p>

                    {order.city && <p>{order.city}</p>}

                    {order.country && <p>{order.country}</p>}

                </div>

            </section>


            {/* Shipment management */}

            <section className="space-y-5">

                <div className="flex items-center gap-3">

                    <Package className="text-indigo-600" />

                    <h2 className="text-xl font-bold text-zinc-900">
                        Shipment Management
                    </h2>

                </div>


                {shipments.length > 0 ? (

                    shipments.map(shipment => (

                        <ShipmentTracking
                            key={shipment.shipment_id}
                            shipment={shipment}
                            onUpdated={loadOrder}
                        />

                    ))

                ) : (

                    <p className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-500">
                        No shipment has been created for this order.
                    </p>

                )}


                {shipments.length === 0 && (

                    <ShipmentForm
                        order={order}
                        onCreated={loadOrder}
                    />

                )}

            </section>

        </div>

    );

}