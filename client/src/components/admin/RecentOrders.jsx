import { Link } from "react-router-dom";

import {
    ArrowRight,
    ShoppingBag
} from "lucide-react";


const statusColors = {

    PENDING: "bg-amber-50 text-amber-700",

    CONFIRMED: "bg-blue-50 text-blue-700",

    PROCESSING: "bg-indigo-50 text-indigo-700",

    SHIPPED: "bg-purple-50 text-purple-700",

    IN_TRANSIT: "bg-violet-50 text-violet-700",

    DELIVERED: "bg-green-50 text-green-700",

    CANCELLED: "bg-red-50 text-red-700",

    FAILED: "bg-red-100 text-red-800",

    RETURNED: "bg-zinc-100 text-zinc-700"

};


const formatPrice = (value) => {

    return new Intl.NumberFormat("en-PK", {

        style: "currency",

        currency: "PKR",

        maximumFractionDigits: 0

    }).format(Number(value || 0));

};


export default function RecentOrders({
    orders = []
}) {

    return (

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-zinc-100 p-5">

                <div>

                    <h2 className="font-semibold text-zinc-900">
                        Recent Orders
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                        Latest customer purchases
                    </p>

                </div>

                <Link
                    to="/admin/orders"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                >
                    View All
                    <ArrowRight size={16} />
                </Link>

            </div>

            {orders.length === 0 ? (

                <div className="p-10 text-center">

                    <ShoppingBag
                        size={35}
                        className="mx-auto text-zinc-300"
                    />

                    <p className="mt-3 text-sm text-zinc-500">
                        No orders available.
                    </p>

                </div>

            ) : (

                <div className="overflow-x-auto">

                    <table className="w-full text-left text-sm">

                        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">

                            <tr>

                                <th className="px-5 py-4">
                                    Order
                                </th>

                                <th className="px-5 py-4">
                                    Customer
                                </th>

                                <th className="px-5 py-4">
                                    Total
                                </th>

                                <th className="px-5 py-4">
                                    Status
                                </th>

                            </tr>

                        </thead>

                        <tbody className="divide-y divide-zinc-100">

                            {orders.map(order => (

                                <tr
                                    key={order.order_id}
                                    className="hover:bg-zinc-50"
                                >

                                    <td className="whitespace-nowrap px-5 py-4 font-medium text-indigo-600">

                                        <Link to={`/admin/orders/${order.order_id}`}>
                                            {order.order_number}
                                        </Link>

                                    </td>

                                    <td className="px-5 py-4">

                                        <p className="font-medium text-zinc-800">
                                            {order.first_name} {order.last_name}
                                        </p>

                                        <p className="text-xs text-zinc-500">
                                            {order.email}
                                        </p>

                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-zinc-800">
                                        {formatPrice(order.total)}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4">

                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            statusColors[order.status] ||
                                            "bg-zinc-100 text-zinc-700"
                                        }`}>
                                            {order.status.replaceAll("_", " ")}
                                        </span>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </section>

    );

}