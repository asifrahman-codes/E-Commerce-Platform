import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { AdminCard, AdminEmptyState } from "./AdminPrimitives";

const statusColors = {
    PENDING: "#d99b2b",
    CONFIRMED: "#5285bf",
    PROCESSING: "#527d65",
    SHIPPED: "#7862b8",
    IN_TRANSIT: "#8b76c4",
    DELIVERED: "#3d9b73",
    CANCELLED: "#d66c6c",
    FAILED: "#b54747",
    RETURNED: "#89928c"
};

export default function OrderStatusChart({
    data = []
}) {

    const total = data.reduce(
        (sum, item) => sum + Number(item.total),
        0
    );

    return (
        <AdminCard title="Order status" description="Distribution across all recorded orders">
            {data.length === 0 ? (
                <AdminEmptyState title="No order data yet" description="Order status distribution will appear here when orders are placed." />
            ) : (
                <div className="grid gap-3 p-5 sm:grid-cols-[1fr_1fr] sm:items-center">
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data} dataKey="total" nameKey="status" innerRadius={58} outerRadius={86} paddingAngle={3} stroke="white" strokeWidth={3}>
                                    {data.map((item) => <Cell key={item.status} fill={statusColors[item.status] || "#89928c"} />)}
                                </Pie>
                                <Tooltip formatter={(value, name) => [value, String(name).replaceAll("_", " ")]} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-2.5">
                        {data.map((item) => (
                            <div key={item.status} className="flex items-center justify-between gap-3 text-xs">
                                <span className="flex items-center gap-2 text-slate-600"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusColors[item.status] || "#89928c" }} />{String(item.status).replaceAll("_", " ")}</span>
                                <span className="font-semibold tabular-nums text-slate-800">{Number(item.total).toLocaleString()} <span className="font-normal text-slate-400">({total ? Math.round((Number(item.total) / total) * 100) : 0}%)</span></span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </AdminCard>
    );

}