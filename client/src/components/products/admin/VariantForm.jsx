import { useEffect, useState } from "react";
import { X } from "lucide-react";

const initialForm = {
    sku: "",
    size: "",
    color: "",
    price_adjustment: "0",
    stock: "0",
    status: "ACTIVE",
};

export default function VariantForm({
    variant,
    onSubmit,
    onCancel,
    submitting,
}) {
    const [form, setForm] = useState(initialForm);

    useEffect(() => {
        if (variant) {
            setForm({
                sku: variant.sku ?? "",
                size: variant.size ?? "",
                color: variant.color ?? "",
                price_adjustment: String(
                    variant.price_adjustment ?? 0
                ),
                stock: String(variant.stock ?? 0),
                status: variant.status ?? "ACTIVE",
            });
        } else {
            setForm(initialForm);
        }
    }, [variant]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        onSubmit({
            sku: form.sku.trim(),
            size: form.size.trim(),
            color: form.color.trim(),
            price_adjustment: Number(form.price_adjustment),
            stock: Number(form.stock),
            status: form.status,
        });
    };

    const inputClass =
        "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-indigo-950";

    const labelClass =
        "mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">

            <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    {variant ? "Edit Variant" : "Add New Variant"}
                </h3>

                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                    <X size={18} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                    <label className={labelClass}>SKU</label>
                    <input
                        name="sku"
                        value={form.sku}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="IPHONE-BLK-128"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div>
                        <label className={labelClass}>Size / Storage</label>
                        <input
                            name="size"
                            value={form.size}
                            onChange={handleChange}
                            className={inputClass}
                            placeholder="128GB / Large"
                            required
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Color</label>
                        <input
                            name="color"
                            value={form.color}
                            onChange={handleChange}
                            className={inputClass}
                            placeholder="Black"
                            required
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            Price Adjustment
                        </label>
                        <input
                            type="number"
                            name="price_adjustment"
                            value={form.price_adjustment}
                            onChange={handleChange}
                            className={inputClass}
                            step="0.01"
                            required
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Stock</label>
                        <input
                            type="number"
                            name="stock"
                            value={form.stock}
                            onChange={handleChange}
                            className={inputClass}
                            min="0"
                            step="1"
                            required
                        />
                    </div>

                </div>

                <div>
                    <label className={labelClass}>Status</label>

                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className={inputClass}
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-2">

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={submitting}
                        className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting
                            ? "Saving..."
                            : variant
                                ? "Update Variant"
                                : "Create Variant"}
                    </button>

                </div>

            </form>
        </div>
    );
}