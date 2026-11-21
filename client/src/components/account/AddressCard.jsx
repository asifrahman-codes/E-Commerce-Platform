import { MapPin, Star, Pencil, Trash2, Loader2 } from "lucide-react";

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  deleting,
  settingDefault,
}) {
  const isDefault = Number(address.is_default) === 1;

  return (
    <div
      className={`relative rounded-[1.25rem] border p-5 transition ${
        isDefault
          ? "border-indigo-200 bg-indigo-50/50 shadow-sm"
          : "border-zinc-200 bg-white hover:border-zinc-300"
      }`}
    >
      {isDefault && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
          <Star size={12} className="fill-indigo-600" />
          Default
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-zinc-100 p-2">
          <MapPin size={18} className="text-zinc-500" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-medium text-zinc-900">{address.street}</p>
          <p className="mt-0.5 text-sm text-zinc-500">
            {address.city}
            {address.postal_code ? `, ${address.postal_code}` : ""}
          </p>
          <p className="text-sm text-zinc-500">{address.country}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4">
        <button
          onClick={() => onEdit(address)}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100"
        >
          <Pencil size={14} />
          Edit
        </button>

        {!isDefault && (
          <button
            onClick={() => onSetDefault(address.address_id)}
            disabled={settingDefault}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-50"
          >
            {settingDefault ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Star size={14} />
            )}
            Set Default
          </button>
        )}

        <button
          onClick={() => onDelete(address.address_id)}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
          Delete
        </button>
      </div>
    </div>
  );
}
