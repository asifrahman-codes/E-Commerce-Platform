const styles = {
    PENDING: "bg-amber-50 text-amber-700",
    CONFIRMED: "bg-blue-50 text-blue-700",
    PROCESSING: "bg-indigo-50 text-indigo-700",
    SHIPPED: "bg-purple-50 text-purple-700",
    DELIVERED: "bg-emerald-50 text-emerald-700",
    CANCELLED: "bg-red-50 text-red-700",
    FAILED: "bg-red-100 text-red-800",
    REFUNDED: "bg-zinc-100 text-zinc-700",
    PAID: "bg-emerald-50 text-emerald-700"
};

export default function OrderStatusBadge({ status }) {

    const value = String(status || "UNKNOWN").toUpperCase();

    return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            styles[value] || "bg-zinc-100 text-zinc-700"
        }`}>
            {value.replaceAll("_", " ")}
        </span>
    );

}