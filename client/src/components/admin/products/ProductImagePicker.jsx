import { useEffect, useMemo, useRef, useState } from "react";

import { ImagePlus, X } from "lucide-react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export default function ProductImagePicker({
    files,
    onChange,
    maxFiles = 5,
    markFirstPrimary = false,
    disabled = false
}) {

    const inputRef = useRef(null);

    const [error, setError] = useState("");

    const previews = useMemo(
        () => files.map((file) => ({
            file,
            url: URL.createObjectURL(file)
        })),
        [files]
    );

    useEffect(() => {

        return () => {
            previews.forEach((item) => URL.revokeObjectURL(item.url));
        };

    }, [previews]);

    const handleSelect = (event) => {

        const selected = Array.from(event.target.files || []);

        event.target.value = "";

        setError("");

        const accepted = [];

        for (const file of selected) {

            if (!ACCEPTED_TYPES.includes(file.type)) {
                setError(`${file.name}: only JPEG, PNG and WebP images are allowed.`);
                continue;
            }

            if (file.size > MAX_SIZE) {
                setError(`${file.name}: image is larger than 5 MB.`);
                continue;
            }

            accepted.push(file);

        }

        if (files.length + accepted.length > maxFiles) {
            setError(`You can add at most ${maxFiles} images at a time.`);
        }

        onChange([...files, ...accepted].slice(0, maxFiles));

    };

    const removeAt = (index) => {
        onChange(files.filter((_, position) => position !== index));
    };

    return (

        <div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleSelect}
                disabled={disabled}
                className="hidden"
            />

            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled || files.length >= maxFiles}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 p-6 text-sm font-semibold text-zinc-600 hover:border-indigo-400 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <ImagePlus size={20} />
                Choose images (JPEG, PNG, WebP — max 5 MB each)
            </button>

            {error && (
                <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            {previews.length > 0 && (

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">

                    {previews.map((item, index) => (

                        <div
                            key={item.url}
                            className="relative overflow-hidden rounded-xl border border-zinc-200"
                        >

                            <img
                                src={item.url}
                                alt={item.file.name}
                                className="h-32 w-full bg-zinc-50 object-contain"
                            />

                            {markFirstPrimary && index === 0 && (
                                <span className="absolute left-2 top-2 rounded-full bg-green-600 px-2 py-1 text-xs font-semibold text-white">
                                    Primary
                                </span>
                            )}

                            <button
                                type="button"
                                onClick={() => removeAt(index)}
                                disabled={disabled}
                                aria-label={`Remove ${item.file.name}`}
                                className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-zinc-600 shadow hover:text-red-600"
                            >
                                <X size={16} />
                            </button>

                        </div>

                    ))}

                </div>

            )}

        </div>

    );

}