import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";


export default function RevenueChart({ data = [] }) {

    const chartData = data.map(item => ({

        date: new Date(item.sale_date).toLocaleDateString(
            "en-PK",
            {
                day: "numeric",
                month: "short"
            }
        ),

        revenue: Number(item.revenue || 0),

        orders: Number(item.total_orders || 0)

    }));


    return (

        <div className="rounded-2xl border border-zinc-200 bg-white p-5">

            <div className="mb-6">

                <h2 className="text-lg font-bold text-zinc-900">
                    Revenue Analytics
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                    Collected revenue over time.
                </p>

            </div>


            {chartData.length === 0 ? (

                <div className="flex h-72 items-center justify-center text-sm text-zinc-500">
                    No sales data available.
                </div>

            ) : (

                <div className="h-72 w-full">

                    <ResponsiveContainer width="100%" height="100%">

                        <AreaChart data={chartData}>

                            <defs>

                                <linearGradient
                                    id="revenueGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >

                                    <stop
                                        offset="5%"
                                        stopColor="#4f46e5"
                                        stopOpacity={0.25}
                                    />

                                    <stop
                                        offset="95%"
                                        stopColor="#4f46e5"
                                        stopOpacity={0}
                                    />

                                </linearGradient>

                            </defs>


                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                            />

                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) =>
                                    `Rs. ${Number(value).toLocaleString()}`
                                }
                            />

                            <Tooltip
                                formatter={(value) => [
                                    `Rs. ${Number(value).toLocaleString()}`,
                                    "Revenue"
                                ]}
                            />


                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#4f46e5"
                                strokeWidth={3}
                                fill="url(#revenueGradient)"
                            />

                        </AreaChart>

                    </ResponsiveContainer>

                </div>

            )}

        </div>

    );

}