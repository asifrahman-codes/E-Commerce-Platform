import { useEffect, useState } from "react";

import { AlertTriangle } from "lucide-react";

import adminInventoryService from "../../../services/admin-inventory.service";


export default function LowStockProducts() {

    const [products, setProducts] = useState([]);

    const [threshold, setThreshold] = useState(5);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        let active = true;

        const loadProducts = async () => {

            try {

                setLoading(true);

                const result = await adminInventoryService.getLowStock(
                    threshold
                );

                if (active) setProducts(result);

            } catch (err) {

                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load low-stock products."
                    );
                }

            } finally {

                if (active) setLoading(false);

            }

        };

        loadProducts();

        return () => {
            active = false;
        };

    }, [threshold]);


    return (

        <div className="space-y-6">

            <div>

                <div className="flex items-center gap-3">

                    <AlertTriangle className="text-amber-600" />

                    <h1 className="text-2xl font-bold">
                        Low Stock Products
                    </h1>

                </div>

                <p className="mt-2 text-sm text-zinc-500">
                    Identify variants requiring restocking.
                </p>

            </div>


            <div className="max-w-xs">

                <label className="mb-2 block text-sm font-semibold">
                    Stock Threshold
                </label>

                <input
                    type="number"
                    min="0"
                    max="100000"
                    value={threshold}
                    onChange={(e) => setThreshold(
                        Math.max(0, Number(e.target.value))
                    )}
                    className="w-full rounded-xl border p-3"
                />

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
                            <th className="p-4">Product</th>
                            <th className="p-4">SKU</th>
                            <th className="p-4">Size</th>
                            <th className="p-4">Color</th>
                            <th className="p-4">Available Stock</th>
                        </tr>

                    </thead>

                    <tbody className="divide-y">

                        {loading ? (

                            <tr>
                                <td colSpan="5" className="p-10 text-center">
                                    Loading...
                                </td>
                            </tr>

                        ) : products.length === 0 ? (

                            <tr>
                                <td colSpan="5" className="p-10 text-center text-zinc-500">
                                    No low-stock variants found.
                                </td>
                            </tr>

                        ) : (

                            products.map(item => (

                                <tr key={item.variant_id}>

                                    <td className="p-4 font-medium">
                                        {item.product_name}
                                    </td>

                                    <td className="p-4">
                                        {item.sku}
                                    </td>

                                    <td className="p-4">
                                        {item.size || "—"}
                                    </td>

                                    <td className="p-4">
                                        {item.color || "—"}
                                    </td>

                                    <td className="p-4 font-bold text-red-600">
                                        {item.stock}
                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </div>

    );

}