import { useCallback, useEffect, useState } from "react";

import adminInventoryService from "../../../services/admin-inventory.service";


const formatDate = (value) => {

    return new Date(value).toLocaleString("en-PK");

};


export default function InventoryHistory() {

    const [data, setData] = useState([]);

    const [pagination, setPagination] = useState({});

    const [type, setType] = useState("");

    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    const loadHistory = useCallback(async () => {

        try {

            setLoading(true);
            setError("");

            const result = await adminInventoryService.getHistory({
                page,
                limit: 20,
                transaction_type: type
            });

            setData(result.items || []);

            setPagination(result.pagination || {});

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to load inventory history."
            );

        } finally {

            setLoading(false);

        }

    }, [page, type]);


    useEffect(() => {

        loadHistory();

    }, [loadHistory]);


    return (

        <div className="space-y-6">

            <div>

                <h1 className="text-2xl font-bold">
                    Inventory History
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                    Review every recorded inventory movement.
                </p>

            </div>


            <div className="rounded-xl border border-zinc-200 bg-white p-4">

                <label className="mb-2 block text-sm font-semibold">
                    Transaction Type
                </label>

                <select
                    value={type}
                    onChange={(e) => {
                        setType(e.target.value);
                        setPage(1);
                    }}
                    className="w-full max-w-xs rounded-xl border p-3"
                >

                    <option value="">All Transactions</option>

                    <option value="PURCHASE">Purchase</option>

                    <option value="SALE">Sale</option>

                    <option value="RETURN">Return</option>

                    <option value="ADJUSTMENT">Adjustment</option>

                </select>

            </div>


            {error && (
                <div className="rounded-xl bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}


            <div className="overflow-x-auto overscroll-x-contain touch-pan-x rounded-2xl border border-zinc-200 bg-white">

                <table className="w-full text-left text-sm">

                    <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">

                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Product</th>
                            <th className="p-4">SKU</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Change</th>
                            <th className="p-4">Reference</th>
                            <th className="p-4">Notes</th>
                        </tr>

                    </thead>


                    <tbody className="divide-y divide-zinc-100">

                        {loading ? (

                            <tr>
                                <td colSpan="7" className="p-10 text-center">
                                    Loading inventory history...
                                </td>
                            </tr>

                        ) : data.length === 0 ? (

                            <tr>
                                <td colSpan="7" className="p-10 text-center text-zinc-500">
                                    No transactions found.
                                </td>
                            </tr>

                        ) : (

                            data.map(item => (

                                <tr key={item.transaction_id}>

                                    <td className="whitespace-nowrap p-4">
                                        {formatDate(item.created_at)}
                                    </td>

                                    <td className="p-4 font-medium">
                                        {item.product_name}
                                    </td>

                                    <td className="p-4">
                                        {item.sku}
                                    </td>

                                    <td className="p-4">
                                        {item.transaction_type}
                                    </td>

                                    <td className={`p-4 font-bold ${
                                        Number(item.quantity_change) > 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }`}>
                                        {Number(item.quantity_change) > 0
                                            ? "+"
                                            : ""}
                                        {item.quantity_change}
                                    </td>

                                    <td className="p-4">
                                        {item.reference_id ?? "—"}
                                    </td>

                                    <td className="p-4">
                                        {item.notes || "—"}
                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>


            <div className="flex items-center justify-between">

                <p className="text-sm text-zinc-500">
                    Total transactions: {pagination.total || 0}
                </p>

                <div className="flex items-center gap-3">

                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                        className="rounded-lg border px-4 py-2 disabled:opacity-40"
                    >
                        Previous
                    </button>

                    <span className="text-sm">
                        {page} / {pagination.totalPages || 1}
                    </span>

                    <button
                        disabled={page >= (pagination.totalPages || 1)}
                        onClick={() => setPage(p => p + 1)}
                        className="rounded-lg border px-4 py-2 disabled:opacity-40"
                    >
                        Next
                    </button>

                </div>

            </div>

        </div>

    );

}