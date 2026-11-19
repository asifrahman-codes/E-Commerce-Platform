import { Search, X } from "lucide-react";

export default function OrderFilters({
    filters,
    onChange,
    onReset
}) {

    return (

        <div className="rounded-2xl border border-zinc-200 bg-white p-4">

            <div className="grid gap-4 md:grid-cols-4">

                <div className="relative">

                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />

                    <input
                        value={filters.search}
                        onChange={(e) => onChange({
                            ...filters,
                            search: e.target.value
                        })}
                        placeholder="Search order/customer..."
                        className="w-full rounded-xl border border-zinc-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-indigo-500"
                    />

                </div>

                <select
                    value={filters.status}
                    onChange={(e) => onChange({
                        ...filters,
                        status: e.target.value
                    })}
                    className="rounded-xl border border-zinc-200 px-3 py-3 text-sm outline-none focus:border-indigo-500"
                >

                    <option value="">All order statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>

                </select>

                <select
                    value={filters.payment_status}
                    onChange={(e) => onChange({
                        ...filters,
                        payment_status: e.target.value
                    })}
                    className="rounded-xl border border-zinc-200 px-3 py-3 text-sm outline-none focus:border-indigo-500"
                >

                    <option value="">All payment statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>

                </select>

                <button
                    type="button"
                    onClick={onReset}
                    className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-50"
                >
                    <X size={16} />
                    Reset filters
                </button>

            </div>

        </div>

    );

}