import { useMemo } from "react";

import { formatPrice } from "../../utils/product.utils";


export default function RevenueChart({ data = [] }) {

    const chartData = useMemo(() => {

        return Array.isArray(data) ? data : [];

    }, [data]);

    const maxRevenue = Math.max(
        ...chartData.map(item => Number(item.revenue)),
        1
    );

    return (

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

            <div className="mb-8">

                <h2 className="text-lg font-semibold text-zinc-900">
                    Revenue Overview
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                    Monthly paid order revenue
                </p>

            </div>

            {chartData.length === 0 ? (

                <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
                    No revenue data available.
                </div>

            ) : (

                <div className="flex h-64 items-end gap-3 overflow-x-auto pb-2">

                    {chartData.map((item, index) => {

                        const revenue = Number(item.revenue);

                        const height = Math.max(
                            (revenue / maxRevenue) * 100,
                            revenue > 0 ? 5 : 0
                        );

                        return (

                            <div
                                key={`${item.month}-${index}`}
                                className="flex min-w-0 flex-1 flex-col items-center justify-end gap-3"
                            >

                                <span className="whitespace-nowrap text-xs text-zinc-500">
                                    {revenue > 0
                                        ? formatPrice(revenue)
                                        : "0"}
                                </span>

                                <div className="flex h-40 w-full items-end">

                                    <div
                                        title={`${item.month}: ${formatPrice(revenue)}`}
                                        style={{
                                            height: `${height}%`
                                        }}
                                        className="w-full rounded-t-lg bg-indigo-500 transition-all hover:bg-indigo-700"
                                    />

                                </div>

                                <span className="text-xs font-medium text-zinc-500">
                                    {item.month}
                                </span>

                            </div>

                        );

                    })}

                </div>

            )}

        </section>

    );

}