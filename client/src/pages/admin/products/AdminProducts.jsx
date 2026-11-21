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
import categoryService from "../../../services/category.service";
import {
    AdminConfirmDialog,
    AdminPageHeader,
    AdminSkeleton
} from "../../../components/admin/AdminPrimitives";
import { useAdminToast } from "../../../components/admin/AdminToastContext";

import { formatPrice } from "../../../utils/product.utils";


export default function AdminProducts() {

    const [products, setProducts] = useState([]);

    const [pagination, setPagination] = useState({});

    const [search, setSearch] = useState("");

    const [status, setStatus] = useState("");

    const [categoryId, setCategoryId] = useState("");

    const [sort, setSort] = useState("newest");

    const [categories, setCategories] = useState([]);

    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [categoryError, setCategoryError] = useState("");
    const [pendingStatusChange, setPendingStatusChange] = useState(null);
    const [statusError, setStatusError] = useState("");
    const [savingStatus, setSavingStatus] = useState(false);
    const notify = useAdminToast();


    const loadProducts = useCallback(async () => {

        try {

            setLoading(true);
            setError("");

            const result = await adminProductService.getProducts({
                search,
                status,
                category_id: categoryId,
                sort,
                page,
                limit: 10
            });

            setProducts(result.items || []);

            setPagination(result.pagination || {});

        } catch (err) {

            setError(
                err.message ||
                err.response?.data?.message ||
                "Unable to load products."
            );

        } finally {

            setLoading(false);

        }

    }, [search, status, categoryId, sort, page]);


    useEffect(() => {

        loadProducts();

    }, [loadProducts]);

    useEffect(() => {
        categoryService.getCategories()
            .then((items) => setCategories(Array.isArray(items) ? items : []))
            .catch((loadError) => {
                setCategoryError(loadError.message || loadError.response?.data?.message || "Category filter options are unavailable.");
            });
    }, []);

    const handleStatusChange = async () => {
        const product = pendingStatusChange;
        if (!product) return;

        const nextStatus =
            product.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        setSavingStatus(true);
        try {

            setError("");
            setStatusError("");

            await adminProductService.updateProductStatus(
                product.product_id,
                nextStatus
            );

            setPendingStatusChange(null);
            notify("Product status updated.");
            await loadProducts();

        } catch (err) {

            setStatusError(err.message || err.response?.data?.message || "Unable to update product status.");

        } finally {
            setSavingStatus(false);
        }

    };


    return (

        <div className="space-y-6">

            <AdminPageHeader
                eyebrow="Catalog management"
                title="Products"
                description="Manage product records, availability, and variant stock."
                actions={
                    <Link
                        to="/admin/products/create"
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#315d47] px-4 text-sm font-semibold text-white hover:bg-[#244b39]"
                    >
                        <Plus size={17} />
                        Add product
                    </Link>
                }
            />

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

                <select
                    value={categoryId}
                    onChange={(e) => {
                        setCategoryId(e.target.value);
                        setPage(1);
                    }}
                    aria-label="Filter by category"
                    className="rounded-xl border border-zinc-200 px-4 py-3"
                >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                        <option key={category.category_id} value={category.category_id}>
                            {category.name}
                        </option>
                    ))}
                </select>

                <select
                    value={sort}
                    onChange={(e) => {
                        setSort(e.target.value);
                        setPage(1);
                    }}
                    aria-label="Sort products"
                    className="rounded-xl border border-zinc-200 px-4 py-3"
                >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="price_asc">Price: low to high</option>
                    <option value="price_desc">Price: high to low</option>
                    <option value="name_asc">Name: A to Z</option>
                    <option value="name_desc">Name: Z to A</option>
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

            {categoryError && <p role="status" className="text-xs text-amber-700">{categoryError}</p>}

            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">

                {loading ? (

                    <AdminSkeleton rows={5} columns={7} />

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

                    <div className="overflow-x-auto overscroll-x-contain touch-pan-x">

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
                                                    onClick={() => {
                                                        setStatusError("");
                                                        setPendingStatusChange(product);
                                                    }}
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

            <AdminConfirmDialog
                open={Boolean(pendingStatusChange)}
                title={`${pendingStatusChange?.status === "ACTIVE" ? "Deactivate" : "Activate"} product?`}
                description={`“${pendingStatusChange?.name || "This product"}” will be ${pendingStatusChange?.status === "ACTIVE" ? "hidden from" : "made available in"} the storefront.`}
                error={statusError}
                confirmLabel={pendingStatusChange?.status === "ACTIVE" ? "Deactivate" : "Activate"}
                danger={pendingStatusChange?.status === "ACTIVE"}
                loading={savingStatus}
                onCancel={() => {
                    setPendingStatusChange(null);
                    setStatusError("");
                }}
                onConfirm={handleStatusChange}
            />

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