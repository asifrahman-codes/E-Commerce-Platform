import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, Layers3 } from "lucide-react";

import variantService from "../../../services/variant.service";

import VariantForm from "./VariantForm";
import VariantTable from "./VariantTable";

export default function VariantManagement({ productId }) {
    const [variants, setVariants] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [editingVariant, setEditingVariant] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const getErrorMessage = (err) =>
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong.";

    const fetchVariants = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await variantService.getAdminProductVariants(productId);

            setVariants(data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchVariants();
    }, [fetchVariants]);

    const handleCreate = () => {
        setEditingVariant(null);
        setShowForm(true);
        setError("");
        setSuccess("");
    };

    const handleEdit = (variant) => {
        setEditingVariant(variant);
        setShowForm(true);
        setError("");
        setSuccess("");
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingVariant(null);
    };

    const handleSubmit = async (formData) => {
        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            if (editingVariant) {
                await variantService.updateVariant(
                    editingVariant.variant_id,
                    formData
                );

                setSuccess("Variant updated successfully.");
            } else {
                await variantService.createVariant(
                    productId,
                    formData
                );

                setSuccess("Variant created successfully.");
            }

            setShowForm(false);
            setEditingVariant(null);

            await fetchVariants();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (variant) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete variant "${variant.sku}"?`
        );

        if (!confirmed) return;

        try {
            setDeletingId(variant.variant_id);
            setError("");
            setSuccess("");

            await variantService.deleteVariant(
                variant.variant_id
            );

            setSuccess("Variant deleted successfully.");

            await fetchVariants();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <section className="mt-10 space-y-6 border-t border-zinc-200 pt-8 dark:border-zinc-800">

            {/* Header */}

            <div className="flex flex-wrap items-center justify-between gap-4">

                <div>
                    <div className="flex items-center gap-2">
                        <Layers3
                            size={22}
                            className="text-indigo-600"
                        />

                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                            Variant Management
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-zinc-500">
                        Create, update, and manage product variants.
                    </p>
                </div>

                <div className="flex items-center gap-2">

                    <button
                        type="button"
                        onClick={fetchVariants}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={handleCreate}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        <Plus size={17} />
                        Add Variant
                    </button>

                </div>
            </div>

            {/* Feedback */}

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400">
                    {success}
                </div>
            )}

            {/* Form */}

            {showForm && (
                <VariantForm
                    variant={editingVariant}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    submitting={submitting}
                />
            )}

            {/* Variants */}

            {loading ? (
                <div className="py-10 text-center text-sm text-zinc-500">
                    Loading variants...
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-zinc-500">
                            Total variants:{" "}
                            <span className="font-semibold text-zinc-900 dark:text-white">
                                {variants.length}
                            </span>
                        </p>
                    </div>

                    <VariantTable
                        variants={variants}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        deletingId={deletingId}
                    />
                </>
            )}

        </section>
    );
}