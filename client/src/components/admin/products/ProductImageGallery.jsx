import { useState } from "react";

import { Star, Trash2 } from "lucide-react";

import adminProductService from "../../../services/admin-product.service";

export default function ProductImageGallery({
    productId,
    images = [],
    onChanged
}) {

    const [busyId, setBusyId] = useState(null);

    const [error, setError] = useState("");

    const run = async (imageId, action, failureMessage) => {

        try {

            setBusyId(imageId);
            setError("");

            await action();

            await onChanged?.();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                failureMessage
            );

        } finally {

            setBusyId(null);

        }

    };

    const makePrimary = (imageId) => {
        run(
            imageId,
            () => adminProductService.setPrimaryImage(productId, imageId),
            "Unable to change the primary image."
        );
    };

    const remove = (imageId) => {

        if (!window.confirm("Delete this image?")) return;

        run(
            imageId,
            () => adminProductService.deleteProductImage(productId, imageId),
            "Unable to delete the image."
        );

    };

    if (!images.length) {

        return (
            <p className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
                This product has no images yet.
            </p>
        );

    }

    return (

        <div>

            {error && (
                <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                {images.map((image) => {

                    const isPrimary = Number(image.is_primary) === 1;

                    return (

                        <div
                            key={image.image_id}
                            className="overflow-hidden rounded-xl border border-zinc-200"
                        >

                            <div className="relative">

                                <img
                                    src={image.image_url}
                                    alt="Product"
                                    className="h-32 w-full bg-zinc-50 object-contain"
                                />

                                {isPrimary && (
                                    <span className="absolute left-2 top-2 rounded-full bg-green-600 px-2 py-1 text-xs font-semibold text-white">
                                        Primary
                                    </span>
                                )}

                            </div>

                            <div className="flex items-center justify-between gap-2 p-2">

                                {!isPrimary ? (

                                    <button
                                        type="button"
                                        onClick={() => makePrimary(image.image_id)}
                                        disabled={busyId === image.image_id}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                                    >
                                        <Star size={14} />
                                        Make primary
                                    </button>

                                ) : (

                                    <span className="text-xs text-zinc-400">
                                        Main image
                                    </span>

                                )}

                                <button
                                    type="button"
                                    onClick={() => remove(image.image_id)}
                                    disabled={busyId === image.image_id}
                                    aria-label="Delete image"
                                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                >
                                    <Trash2 size={16} />
                                </button>

                            </div>

                        </div>

                    );

                })}

            </div>

        </div>

    );

}