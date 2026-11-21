import { Link } from "react-router-dom";

import { Eye, ShoppingBag } from "lucide-react";

import OrderStatusBadge from "./OrderStatusBadge";

const formatPrice = (value) => {

    return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        maximumFractionDigits: 0
    }).format(Number(value || 0));

};

const formatDate = (date) => {

    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-PK", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

};

export default function OrdersTable({ orders = [] }) {

    if (!orders.length) {

        return (
            <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">

                <ShoppingBag
                    size={40}
                    className="mx-auto text-zinc-300"
                />

                <h3 className="mt-4 font-semibold text-zinc-800">
                    No orders found
                </h3>

                <p className="mt-2 text-sm text-zinc-500">
                    Try changing your search or filters.
                </p>

            </div>
        );

    }

    return (

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">

            <div className="overflow-x-auto overscroll-x-contain touch-pan-x">

                <table className="w-full min-w-[850px] text-left text-sm">

                    <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">

                        <tr>
                            <th className="px-5 py-4">Order</th>
                            <th className="px-5 py-4">Customer</th>
                            <th className="px-5 py-4">Date</th>
                            <th className="px-5 py-4">Total</th>
                            <th className="px-5 py-4">Payment</th>
                            <th className="px-5 py-4">Order Status</th>
                            <th className="px-5 py-4">Action</th>
                        </tr>

                    </thead>

                    <tbody className="divide-y divide-zinc-100">

                        {orders.map(order => (

                            <tr
                                key={order.order_id}
                                className="hover:bg-zinc-50"
                            >

                                <td className="px-5 py-4 font-semibold text-indigo-600">
                                    {order.order_number}
                                </td>

                                <td className="px-5 py-4">

                                    <p className="font-medium text-zinc-800">
                                        {order.first_name} {order.last_name}
                                    </p>

                                    <p className="text-xs text-zinc-500">
                                        {order.email}
                                    </p>

                                </td>

                                <td className="whitespace-nowrap px-5 py-4 text-zinc-600">
                                    {formatDate(order.created_at)}
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 font-semibold">
                                    {formatPrice(order.total)}
                                </td>

                                <td className="px-5 py-4">
                                    <OrderStatusBadge status={order.payment_status} />
                                </td>

                                <td className="px-5 py-4">
                                    <OrderStatusBadge status={order.status} />
                                </td>

                                <td className="px-5 py-4">

                                    <Link
                                        to={`/admin/orders/${order.order_id}`}
                                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                                    >
                                        <Eye size={15} />
                                        Details
                                    </Link>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    );

}