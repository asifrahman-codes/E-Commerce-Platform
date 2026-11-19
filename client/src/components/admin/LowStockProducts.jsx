import { Link } from "react-router-dom";

import { AlertTriangle, Package } from "lucide-react";


export default function LowStockProducts({
    variants = []
}) {

    return (

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

                <div>

                    <h2 className="font-semibold text-zinc-900">
                        Low Stock Alerts
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                        Products requiring restocking
                    </p>

                </div>

                <AlertTriangle
                    className="text-amber-500"
                    size={22}
                />

            </div>

            <div className="mt-5 space-y-4">

                {variants.length === 0 ? (

                    <div className="py-8 text-center">

                        <Package
                            size={32}
                            className="mx-auto text-zinc-300"
                        />

                        <p className="mt-3 text-sm text-zinc-500">
                            No low-stock variants found.
                        </p>

                    </div>

                ) : variants.map(variant => (

                    <div
                        key={variant.variant_id}
                        className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-4 last:border-0"
                    >

                        <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-zinc-800">
                                {variant.product_name}
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                                SKU: {variant.sku}
                            </p>

                        </div>

                        <span className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${
                            Number(variant.stock) === 0
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                        }`}>
                            {variant.stock} left
                        </span>

                    </div>

                ))}

            </div>

            <Link
                to="/admin/inventory"
                className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
                Manage Inventory →
            </Link>

        </section>

    );

}