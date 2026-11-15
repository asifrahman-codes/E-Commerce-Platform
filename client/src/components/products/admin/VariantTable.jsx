import { Edit, Trash2 } from "lucide-react";

export default function VariantTable({
    variants,
    onEdit,
    onDelete,
    deletingId,
}) {
    if (!variants.length) {
        return (
            <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
                <p className="font-medium text-zinc-700 dark:text-zinc-300">
                    No variants found.
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                    Create your first product variant.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">

            <table className="w-full min-w-[850px] text-left text-sm">

                <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                    <tr>
                        <th className="px-4 py-3">SKU</th>
                        <th className="px-4 py-3">Size</th>
                        <th className="px-4 py-3">Color</th>
                        <th className="px-4 py-3">Price Adjustment</th>
                        <th className="px-4 py-3">Final Price</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">

                    {variants.map((variant) => (
                        <tr
                            key={variant.variant_id}
                            className="text-zinc-700 dark:text-zinc-300"
                        >
                            <td className="px-4 py-3 font-medium">
                                {variant.sku}
                            </td>

                            <td className="px-4 py-3">
                                {variant.size || "—"}
                            </td>

                            <td className="px-4 py-3">
                                {variant.color || "—"}
                            </td>

                            <td className="px-4 py-3">
                                {Number(
                                    variant.price_adjustment
                                ).toFixed(2)}
                            </td>

                            <td className="px-4 py-3 font-medium">
                                {Number(
                                    variant.final_price ??
                                    (
                                        Number(variant.product_price) +
                                        Number(variant.price_adjustment)
                                    )
                                ).toFixed(2)}
                            </td>

                            <td className="px-4 py-3">
                                {variant.stock}
                            </td>

                            <td className="px-4 py-3">
                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                        variant.status === "ACTIVE"
                                            ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                    }`}
                                >
                                    {variant.status}
                                </span>
                            </td>

                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">

                                    <button
                                        type="button"
                                        onClick={() => onEdit(variant)}
                                        title="Edit variant"
                                        className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                                    >
                                        <Edit size={16} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onDelete(variant)}
                                        disabled={
                                            deletingId === variant.variant_id
                                        }
                                        title="Delete variant"
                                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                </div>
                            </td>
                        </tr>
                    ))}

                </tbody>
            </table>
        </div>
    );
}