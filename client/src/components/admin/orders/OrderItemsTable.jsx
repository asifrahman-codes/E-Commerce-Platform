import { Package } from "lucide-react";

const formatPrice = (value) => {

    return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        maximumFractionDigits: 2
    }).format(Number(value || 0));

};

export default function OrderItemsTable({ items = [] }) {

    return (

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">

            <div className="border-b border-zinc-100 p-5">

                <h2 className="font-semibold text-zinc-900">
                    Ordered Products
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                    Products included in this order
                </p>

            </div>

            {!items.length ? (

                <div className="p-8 text-center text-sm text-zinc-500">
                    No order items found.
                </div>

            ) : (

                <div className="overflow-x-auto overscroll-x-contain touch-pan-x">

                    <table className="w-full min-w-[600px] text-left text-sm">

                        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                            <tr>
                                <th className="px-5 py-4">Product</th>
                                <th className="px-5 py-4">SKU</th>
                                <th className="px-5 py-4">Unit Price</th>
                                <th className="px-5 py-4">Quantity</th>
                                <th className="px-5 py-4">Total</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-zinc-100">

                            {items.map((item, index) => {

                                const quantity = Number(item.quantity || 0);

                                const unitPrice = Number(item.unit_price || 0);

                                const total = item.total_price != null
                                    ? Number(item.total_price)
                                    : unitPrice * quantity;

                                return (

                                    <tr key={item.order_item_id ?? index}>

                                        <td className="px-5 py-4">

                                            <div className="flex items-center gap-3">

                                                <Package
                                                    size={20}
                                                    className="shrink-0 text-indigo-500"
                                                />

                                                <span className="font-medium text-zinc-800">
                                                    {item.product_name || "Product"}
                                                </span>

                                            </div>

                                        </td>

                                        <td className="px-5 py-4 text-zinc-500">
                                            {item.sku || "—"}
                                        </td>

                                        <td className="px-5 py-4">
                                            {formatPrice(unitPrice)}
                                        </td>

                                        <td className="px-5 py-4">
                                            {quantity}
                                        </td>

                                        <td className="px-5 py-4 font-semibold">
                                            {formatPrice(total)}
                                        </td>

                                    </tr>

                                );

                            })}

                        </tbody>

                    </table>

                </div>

            )}

        </section>

    );

}