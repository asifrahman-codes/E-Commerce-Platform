import { Trophy, Package } from "lucide-react";


export default function TopSellingProducts({ products = [] }) {

    return (

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">

            <div className="border-b border-zinc-100 p-5">

                <h2 className="font-bold text-zinc-900">
                    Best Selling Products
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                    Products ranked by units sold.
                </p>

            </div>


            {products.length === 0 ? (

                <p className="p-6 text-sm text-zinc-500">
                    No product sales available.
                </p>

            ) : (

                <div className="divide-y divide-zinc-100">

                    {products.map((product, index) => (

                        <div
                            key={product.variant_id}
                            className="flex items-center justify-between gap-4 p-4"
                        >

                            <div className="flex min-w-0 items-center gap-3">

                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100">

                                    {index === 0
                                        ? <Trophy className="text-amber-500" size={20} />
                                        : <Package className="text-zinc-500" size={20} />
                                    }

                                </div>


                                <div className="min-w-0">

                                    <p className="truncate text-sm font-semibold text-zinc-900">
                                        {product.product_name}
                                    </p>

                                    <p className="mt-1 text-xs text-zinc-500">
                                        Variant #{product.variant_id}
                                    </p>

                                </div>

                            </div>


                            <div className="shrink-0 text-right">

                                <p className="font-bold text-zinc-900">
                                    {Number(product.total_sold).toLocaleString()} sold
                                </p>

                                <p className="mt-1 text-xs text-zinc-500">
                                    Rs. {Number(product.total_sales || 0).toLocaleString()}
                                </p>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </section>

    );

}