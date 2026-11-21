import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import { formatPrice } from "../../utils/product.utils";
import { AdminCard, AdminEmptyState } from "./AdminPrimitives";

export default function RevenueChart({ data = [] }) {
    const chartData = Array.isArray(data) ? data : [];
    return (
        <AdminCard title="Revenue trend" description="Monthly paid-order revenue, trailing 12 months">
            {chartData.length === 0 ? (
                <AdminEmptyState title="No revenue data yet" description="Revenue will appear here after paid orders have been recorded." />
            ) : (
                <div className="h-[280px] px-3 py-5 sm:px-5">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                            <defs>
                                <linearGradient id="adminRevenueFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#527d65" stopOpacity={0.22} />
                                    <stop offset="95%" stopColor="#527d65" stopOpacity={0.01} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="#edf1ee" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#718078", fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} width={70} tick={{ fill: "#718078", fontSize: 10 }} tickFormatter={(value) => formatPrice(value)} />
                            <Tooltip formatter={(value) => formatPrice(value)} contentStyle={{ borderRadius: 12, borderColor: "#e4e9e3", fontSize: 12 }} />
                            <Area type="monotone" dataKey="revenue" stroke="#315d47" strokeWidth={2.5} fill="url(#adminRevenueFill)" activeDot={{ r: 5, fill: "#315d47" }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </AdminCard>
    );
}