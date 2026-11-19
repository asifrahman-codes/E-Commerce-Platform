const statusStyles = {

    PENDING: "bg-amber-500",

    CONFIRMED: "bg-blue-500",

    PROCESSING: "bg-indigo-500",

    SHIPPED: "bg-purple-500",

    IN_TRANSIT: "bg-violet-500",

    DELIVERED: "bg-emerald-500",

    CANCELLED: "bg-red-500",

    FAILED: "bg-red-700",

    RETURNED: "bg-zinc-500"

};


export default function OrderStatusChart({
    data = []
}) {

    const total = data.reduce(
        (sum, item) => sum + Number(item.total),
        0
    );

    return (

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

            <h2 className="text-lg font-semibold text-zinc-900">
                Order Status
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
                Distribution of all orders
            </p>

            <div className="mt-7 space-y-5">

                {data.length === 0 ? (

                    <p className="text-sm text-zinc-500">
                        No order data available.
                    </p>

                ) : data.map(item => {

                    const percentage = total > 0
                        ? (Number(item.total) / total) * 100
                        : 0;

                    return (

                        <div key={item.status}>

                            <div className="mb-2 flex items-center justify-between text-sm">

                                <span className="font-medium text-zinc-700">
                                    {item.status.replaceAll("_", " ")}
                                </span>

                                <span className="text-zinc-500">
                                    {item.total}
                                </span>

                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-zinc-100">

                                <div
                                    className={`h-full rounded-full ${
                                        statusStyles[item.status] || "bg-zinc-500"
                                    }`}
                                    style={{
                                        width: `${percentage}%`
                                    }}
                                />

                            </div>

                        </div>

                    );

                })}

            </div>

        </section>

    );

}