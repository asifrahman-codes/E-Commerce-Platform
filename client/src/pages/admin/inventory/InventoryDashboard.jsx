import { useEffect, useState } from "react";

import {
    Package,
    Warehouse,
    AlertTriangle,
    Activity
} from "lucide-react";

import adminInventoryService from "../../../services/admin-inventory.service";

import { Link } from "react-router-dom";


export default function InventoryDashboard() {

    const [stats, setStats] = useState(null);

    const [lowStock, setLowStock] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const [dashboard, lowStockData] = await Promise.all([
                    adminInventoryService.getDashboard(),
                    adminInventoryService.getLowStock(5)
                ]);

                setStats(dashboard);
                setLowStock(lowStockData);

            } catch (err) {

                setError(
                    err.response?.data?.message ||
                    "Unable to load inventory."
                );

            } finally {

                setLoading(false);

            }

        };

        loadDashboard();

    }, []);


    if (loading) return <p className="p-8">Loading inventory...</p>;

    if (error) return <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>;


    const cards = [
        {
            title: "Active Variants",
            value: stats.total_variants,
            icon: Package
        },
        {
            title: "Total Stock",
            value: stats.total_stock,
            icon: Warehouse
        },
        {
            title: "Out of Stock",
            value: stats.out_of_stock,
            icon: AlertTriangle
        },
        {
            title: "Transactions Today",
            value: stats.transactions_today,
            icon: Activity
        }
    ];


    return (

        <div className="space-y-7">

            <div>

                <h1 className="text-2xl font-bold text-zinc-900">
                    Inventory Management
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                    Monitor stock levels and inventory activity.
                </p>

            </div>


            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

                {cards.map(card => {

                    const Icon = card.icon;

                    return (

                        <div
                            key={card.title}
                            className="rounded-2xl border border-zinc-200 bg-white p-5"
                        >

                            <div className="flex items-center justify-between">

                                <p className="text-sm text-zinc-500">
                                    {card.title}
                                </p>

                                <Icon className="text-indigo-600" />

                            </div>

                            <p className="mt-4 text-3xl font-bold text-zinc-900">
                                {Number(card.value || 0).toLocaleString()}
                            </p>

                        </div>

                    );

                })}

            </div>


            <div className="flex flex-wrap gap-3">

                <Link
                    to="/admin/inventory/history"
                    className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white"
                >
                    Inventory History
                </Link>

                <Link
                    to="/admin/inventory/low-stock"
                    className="rounded-xl border border-zinc-200 bg-white px-5 py-3 font-semibold"
                >
                    Low Stock Products
                </Link>

            </div>


            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">

                <div className="border-b border-zinc-100 p-5">

                    <h2 className="font-semibold text-zinc-900">
                        Low Stock Alerts
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                        Variants with five or fewer units.
                    </p>

                </div>


                {lowStock.length === 0 ? (

                    <p className="p-6 text-sm text-zinc-500">
                        No low-stock variants found.
                    </p>

                ) : (

                    <div className="overflow-x-auto overscroll-x-contain touch-pan-x">

                        <table className="w-full text-sm text-left">

                            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                                <tr>
                                    <th className="p-4">Product</th>
                                    <th className="p-4">SKU</th>
                                    <th className="p-4">Size</th>
                                    <th className="p-4">Color</th>
                                    <th className="p-4">Stock</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">

                                {lowStock.slice(0, 5).map(item => (

                                    <tr key={item.variant_id}>

                                        <td className="p-4 font-medium">
                                            {item.product_name}
                                        </td>

                                        <td className="p-4">{item.sku}</td>

                                        <td className="p-4">{item.size || "—"}</td>

                                        <td className="p-4">{item.color || "—"}</td>

                                        <td className="p-4">

                                            <span className="font-bold text-red-600">
                                                {item.stock}
                                            </span>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        </div>

    );

}