import { useCallback, useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
    Plus,
    Search,
    Edit,
    Package,
    RefreshCw
} from "lucide-react";

import adminProductService from "../../../services/admin-product.service";

import { formatPrice } from "../../../utils/product.utils";


export default function AdminProducts() {

    const [products, setProducts] = useState([]);

    const [pagination, setPagination] = useState({});

    const [search, setSearch] = useState("");

    const [status, setStatus] = useState("");

    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [message, setMessage] = useState("");


    const loadProducts = useCallback(async () => {

        try {

            setLoading(true);
            setError("");

            const result = await adminProductService.getProducts({
                search,
                status,
                page,
                limit: 10
            });

            setProducts(result.items || []);

            setPagination(result.pagination || {});

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to load products."
            );

        } finally {

            setLoading(false);

        }

    }, [search, status, page]);


    useEffect(() => {

        loadProducts();

    }, [loadProducts]);


    const handleStatusChange = async (product) => {

        const nextStatus =
            product.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        if (!window.confirm(
            `Change product status to ${nextStatus}?`
        )) return;

        try {

            setError("");
            setMessage("");

            await adminProductService.updateProductStatus(
                product.product_id,
                nextStatus
            );

            setMessage("Product status updated.");

            loadProducts();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to update product status."
            );

        }

    };


    return (

        <div className="space-y-7">

            <div className="flex flex-wrap items-center justify-between gap-4">

                <div>

                    <h1 className="text-2xl font-bold text-zinc-900">
                        Product Management
                    </h1>

                    <p className="mt-2 text-sm text-zinc-500">
                        Manage your store products and availability.
                    </p>

                </div>

                <Link
                    to="/admin/products/create"
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
                >
                    <Plus size={18} />
                    Add Product
                </Link>

            </div>


            {message && (
                <div className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
                    {message}
                </div>
            )}

            {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}


            <div className="flex flex-wrap gap-3 rounded-2xl border border-zinc-200 bg-white p-4">

                <div className="relative min-w-[220px] flex-1">

                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />

                    <input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search products..."
                        className="w-full rounded-xl border border-zinc-200 py-3 pl-10 pr-4 outline-none focus:border-indigo-500"
                    />

                </div>


                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                    }}
                    className="rounded-xl border border-zinc-200 px-4 py-3"
                >

                    <option value="">All Status</option>

                    <option value="ACTIVE">Active</option>

                    <option value="INACTIVE">Inactive</option>

                </select>


                <button
                    type="button"
                    onClick={loadProducts}
                    className="rounded-xl border border-zinc-200 p-3 hover:bg-zinc-50"
                    aria-label="Refresh products"
                >
                    <RefreshCw size={18} />
                </button>

            </div>


            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">

                {loading ? (

                    <div className="p-12 text-center text-zinc-500">
                        Loading products...
                    </div>

                ) : products.length === 0 ? (

                    <div className="p-12 text-center">

                        <Package
                            size={40}
                            className="mx-auto text-zinc-300"
                        />

                        <p className="mt-3 font-medium">
                            No products found.
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full text-left text-sm">

                            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">

                                <tr>
                                    <th className="p-4">Product</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4">Variants</th>
                                    <th className="p-4">Stock</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Actions</th>
                                </tr>

                            </thead>

                            <tbody className="divide-y divide-zinc-100">

                                {products.map(product => (

                                    <tr key={product.product_id}>

                                        <td className="p-4">

                                            <div className="flex items-center gap-3">

                                                {product.image_url ? (

                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="h-12 w-12 rounded-lg bg-zinc-50 object-contain"
                                                    />

                                                ) : (

                                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100">
                                                        <Package size={20} />
                                                    </div>

                                                )}

                                                <div>
                                                    <p className="font-semibold text-zinc-900">
                                                        {product.name}
                                                    </p>

                                                    <p className="text-xs text-zinc-500">
                                                        {product.slug}
                                                    </p>
                                                </div>

                                            </div>

                                        </td>

                                        <td className="p-4">
                                            {product.category_name || "—"}
                                        </td>

                                        <td className="p-4 font-medium">
                                            {formatPrice(product.base_price)}
                                        </td>

                                        <td className="p-4">
                                            {product.variant_count}
                                        </td>

                                        <td className="p-4">
                                            {product.total_stock}
                                        </td>

                                        <td className="p-4">

                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                product.status === "ACTIVE"
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-zinc-100 text-zinc-600"
                                            }`}>
                                                {product.status}
                                            </span>

                                        </td>

                                        <td className="p-4">

                                            <div className="flex flex-wrap items-center gap-2">

                                                <Link
                                                    to={`/admin/products/${product.product_id}/edit`}
                                                    className="rounded-lg border border-zinc-200 p-2 hover:bg-zinc-50"
                                                    title="Edit product"
                                                >
                                                    <Edit size={16} />
                                                </Link>

                                                <Link
                                                    to={`/admin/products/${product.product_id}/variants`}
                                                    className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold hover:bg-zinc-50"
                                                >
                                                    Variants
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusChange(product)}
                                                    className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold hover:bg-zinc-50"
                                                >
                                                    {product.status === "ACTIVE"
                                                        ? "Deactivate"
                                                        : "Activate"}
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            <div className="flex items-center justify-between">

                <p className="text-sm text-zinc-500">
                    Total: {pagination.total || 0} products
                </p>

                <div className="flex gap-2">

                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                        className="rounded-lg border px-4 py-2 disabled:opacity-40"
                    >
                        Previous
                    </button>

                    <span className="px-3 py-2 text-sm">
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