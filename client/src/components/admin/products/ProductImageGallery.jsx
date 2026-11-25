import { useRef, useState } from "react";

import { ImagePlus, Star, Trash2 } from "lucide-react";

import adminProductService from "../../../services/admin-product.service";
import SafeImage from "../../common/SafeImage";

export default function ProductImageGallery({
    productId,
    images = [],
    onChanged
}) {

    const [busyId, setBusyId] = useState(null);

    const [error, setError] = useState("");
    const [replaceTarget, setReplaceTarget] = useState(null);
    const [replaceProgress, setReplaceProgress] = useState(null);
    const replaceInputRef = useRef(null);

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

    const replace = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file || !replaceTarget) return;

        setError("");
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setError("Choose a JPEG, PNG or WebP image.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Product images must be 5 MB or smaller.");
            return;
        }

        const imageId = replaceTarget;
        await run(
            imageId,
            async () => {
                setReplaceProgress(0);
                await adminProductService.replaceProductImage(
                    imageId,
                    file,
                    (progressEvent) => {
                        if (progressEvent.total) {
                            setReplaceProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
                        }
                    }
                );
            },
            "Unable to replace the image."
        );
        setReplaceTarget(null);
        setReplaceProgress(null);
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
            <input
                ref={replaceInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={replace}
                className="hidden"
            />

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

                                <SafeImage
                                    src={image.image_url}
                                    alt="Product"
                                    className="h-32 w-full bg-zinc-50 object-contain"
                                    fallbackClassName="h-32 bg-zinc-50"
                                    fallbackSize={36}
                                />

                                {isPrimary && (
                                    <span className="absolute left-2 top-2 rounded-full bg-green-600 px-2 py-1 text-xs font-semibold text-white">
                                        Primary
                                    </span>
                                )}

                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 p-2">

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
                                    onClick={() => {
                                        setReplaceTarget(image.image_id);
                                        replaceInputRef.current?.click();
                                    }}
                                    disabled={busyId === image.image_id}
                                    aria-label="Replace image"
                                    className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                                >
                                    <ImagePlus size={14} />
                                    Replace
                                </button>

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
                            {busyId === image.image_id && replaceProgress !== null && (
                                <div className="px-2 pb-2" role="status" aria-live="polite">
                                    <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                                        <div className="h-full bg-indigo-600 transition-all" style={{ width: `${replaceProgress}%` }} />
                                    </div>
                                    <p className="mt-1 text-[11px] text-zinc-500">Replacing… {replaceProgress}%</p>
                                </div>
                            )}

                        </div>

                    );

                })}

            </div>

        </div>

    );

}