import { Link } from "react-router-dom";


const statusColors = {

    PENDING: "bg-amber-100 text-amber-700",

    CONFIRMED: "bg-indigo-100 text-indigo-700",

    PROCESSING: "bg-purple-100 text-purple-700",

    SHIPPED: "bg-sky-100 text-sky-700",

    DELIVERED: "bg-emerald-100 text-emerald-700",

    CANCELLED: "bg-red-100 text-red-700"

};


export default function RecentOrders({ orders = [] }) {

    return (

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 p-5">

                <div>

                    <h2 className="font-bold text-zinc-900">
                        Recent Orders
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                        Latest customer orders.
                    </p>

                </div>

                <Link
                    to="/admin/orders"
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                >
                    View all
                </Link>

            </div>


            <div className="overflow-x-auto overscroll-x-contain touch-pan-x">

                <table className="w-full text-left text-sm">

                    <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">

                        <tr>
                            <th className="whitespace-nowrap p-4">Order</th>
                            <th className="whitespace-nowrap p-4">Customer</th>
                            <th className="whitespace-nowrap p-4">Total</th>
                            <th className="whitespace-nowrap p-4">Payment</th>
                            <th className="whitespace-nowrap p-4">Status</th>
                            <th className="whitespace-nowrap p-4">Date</th>
                            <th className="p-4">Action</th>
                        </tr>

                    </thead>


                    <tbody className="divide-y divide-zinc-100">

                        {orders.length === 0 ? (

                            <tr>
                                <td colSpan="7" className="p-10 text-center text-zinc-500">
                                    No orders found.
                                </td>
                            </tr>

                        ) : (

                            orders.map(order => (

                                <tr key={order.order_id}>

                                    <td className="whitespace-nowrap p-4 font-semibold">
                                        #{order.order_number}
                                    </td>

                                    <td className="whitespace-nowrap p-4">

                                        <p className="font-medium text-zinc-800">
                                            {order.first_name} {order.last_name}
                                        </p>

                                        <p className="text-xs text-zinc-500">
                                            {order.email}
                                        </p>

                                    </td>

                                    <td className="whitespace-nowrap p-4 font-semibold">
                                        Rs. {Number(order.total).toLocaleString()}
                                    </td>

                                    <td className="whitespace-nowrap p-4">
                                        {order.payment_status}
                                    </td>

                                    <td className="whitespace-nowrap p-4">

                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            statusColors[order.status] ||
                                            "bg-zinc-100 text-zinc-700"
                                        }`}>
                                            {order.status}
                                        </span>

                                    </td>

                                    <td className="whitespace-nowrap p-4 text-zinc-500">
                                        {new Date(order.created_at).toLocaleDateString("en-PK")}
                                    </td>

                                    <td className="whitespace-nowrap p-4">

                                        <Link
                                            to={`/admin/orders/${order.order_id}`}
                                            className="font-semibold text-indigo-600 hover:underline"
                                        >
                                            View
                                        </Link>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </section>

    );

}