import { useState } from "react";

import { useNavigate } from "react-router-dom";

import adminInventoryService from "../../../services/admin-inventory.service";


export default function StockAdjustment() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        variant_id: "",
        quantity_change: "",
        transaction_type: "PURCHASE",
        notes: ""
    });

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [result, setResult] = useState(null);


    const handleChange = (e) => {

        setForm(previous => ({
            ...previous,
            [e.target.name]: e.target.value
        }));

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);
            setError("");
            setResult(null);

            const data = await adminInventoryService.adjustStock({
                ...form,
                variant_id: Number(form.variant_id),
                quantity_change: Number(form.quantity_change)
            });

            setResult(data);

            setForm(previous => ({
                ...previous,
                quantity_change: "",
                notes: ""
            }));

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to adjust inventory."
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="mx-auto max-w-2xl space-y-6">

            <div>

                <h1 className="text-2xl font-bold">
                    Stock Adjustment
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                    Add purchased stock or make a manual correction.
                </p>

            </div>


            <form
                onSubmit={handleSubmit}
                className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6"
            >

                {error && (
                    <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}


                <div>

                    <label className="mb-2 block text-sm font-semibold">
                        Variant ID
                    </label>

                    <input
                        type="number"
                        name="variant_id"
                        value={form.variant_id}
                        onChange={handleChange}
                        min="1"
                        required
                        className="w-full rounded-xl border p-3"
                        placeholder="Enter product variant ID"
                    />

                </div>


                <div>

                    <label className="mb-2 block text-sm font-semibold">
                        Transaction Type
                    </label>

                    <select
                        name="transaction_type"
                        value={form.transaction_type}
                        onChange={handleChange}
                        className="w-full rounded-xl border p-3"
                    >

                        <option value="PURCHASE">
                            Purchase / Restock
                        </option>

                        <option value="ADJUSTMENT">
                            Manual Adjustment
                        </option>

                    </select>

                </div>


                <div>

                    <label className="mb-2 block text-sm font-semibold">
                        Quantity Change
                    </label>

                    <input
                        type="number"
                        name="quantity_change"
                        value={form.quantity_change}
                        onChange={handleChange}
                        required
                        step="1"
                        min={form.transaction_type === "PURCHASE" ? "1" : undefined}
                        placeholder="Example: 20 or -3"
                        className="w-full rounded-xl border p-3"
                    />

                    <p className="mt-2 text-xs text-zinc-500">
                        Positive numbers increase stock. Negative numbers decrease stock. Purchases must be positive.
                    </p>

                </div>


                <div>

                    <label className="mb-2 block text-sm font-semibold">
                        Notes
                    </label>

                    <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        maxLength={255}
                        rows={4}
                        placeholder="Reason for inventory change..."
                        className="w-full rounded-xl border p-3"
                    />

                </div>


                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-indigo-600 p-3 font-semibold text-white disabled:opacity-50"
                >
                    {loading ? "Updating..." : "Update Inventory"}
                </button>

            </form>


            {result && (

                <div className="space-y-3 rounded-xl border border-green-200 bg-green-50 p-5 text-sm text-green-800">

                    <h2 className="font-bold">
                        Inventory Updated Successfully
                    </h2>

                    <p>
                        Previous stock: {result.previous_stock}
                    </p>

                    <p>
                        Quantity change: {result.quantity_change}
                    </p>

                    <p>
                        Current stock: {result.current_stock}
                    </p>

                    <button
                        onClick={() => navigate("/admin/inventory/history")}
                        className="font-semibold underline"
                    >
                        View Inventory History
                    </button>

                </div>

            )}

        </div>

    );

}