import {
    MapPin,
    Pencil,
    Trash2,
    Star,
} from "lucide-react";

export default function AddressCard({
    address,
    onEdit,
    onDelete,
    onSetDefault,
}) {
    return (
        <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                        <MapPin size={18} />
                    </div>

                    <div>
                        <h3 className="font-semibold text-zinc-900">
                            {address.recipient_name}
                        </h3>

                        <p className="text-sm text-zinc-500">
                            {address.phone}
                        </p>
                    </div>
                </div>

                {Boolean(address.is_default) && (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        Default
                    </span>
                )}
            </div>

            <div className="mt-4 space-y-1 text-sm text-zinc-600">
                <p>{address.address_line_1}</p>

                {address.address_line_2 && (
                    <p>{address.address_line_2}</p>
                )}

                <p>
                    {[
                        address.city,
                        address.state,
                        address.postal_code,
                    ]
                        .filter(Boolean)
                        .join(", ")}
                </p>

                <p>{address.country}</p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-4">
                <button
                    onClick={() => onEdit(address)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                    <Pencil size={15} />
                    Edit
                </button>

                <button
                    onClick={() => onDelete(address.address_id)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800"
                >
                    <Trash2 size={15} />
                    Delete
                </button>

                {!Boolean(address.is_default) && (
                    <button
                        onClick={() => onSetDefault(address.address_id)}
                        className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-indigo-600"
                    >
                        <Star size={15} />
                        Make Default
                    </button>
                )}
            </div>
        </article>
    );
}