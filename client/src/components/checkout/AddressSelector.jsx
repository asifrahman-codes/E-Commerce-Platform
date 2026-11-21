import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";

import AddressForm from "./AddressForm";
import {
  createAddress,
  updateAddress,
  deleteAddress,
} from "../../services/address.service";
import { getErrorMessage } from "../../utils/error.utils";

export default function AddressSelector({ addresses, selectedId, onSelect, onChanged }) {
  const [formState, setFormState] = useState(null); // null | { address? }
  const [error, setError] = useState("");

  const handleSave = async (values) => {
    const body = {
      street: values.street,
      city: values.city,
      country: values.country,
      postal_code: values.postal_code || "",
      is_default: values.is_default,
    };

    if (formState.address) {
      const { is_default, ...rest } = body;
      const saved = await updateAddress(formState.address.address_id, is_default ? body : rest);
      await onChanged(saved.address_id);
    } else {
      const saved = await createAddress(body);
      await onChanged(saved.address_id);
    }

    setFormState(null);
  };

  const handleDelete = async (address) => {
    if (!window.confirm("Delete this address?")) return;

    try {
      setError("");
      await deleteAddress(address.address_id);
      await onChanged(
        Number(selectedId) === Number(address.address_id) ? null : selectedId
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <section aria-labelledby="delivery-address-heading" className="shop-panel p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id="delivery-address-heading" className="flex items-center gap-2 text-lg font-bold text-zinc-900">
          <MapPin size={20} className="text-indigo-600" /> Delivery address
        </h2>
        {addresses.length > 0 && (
          <button type="button" onClick={() => setFormState({})} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-indigo-200 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50">
            <Plus size={16} /> Add new
          </button>
        )}
      </div>

      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {addresses.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-zinc-300 p-6 text-center">
          <p className="text-sm text-zinc-600">You have no saved addresses yet.</p>
          <button type="button" onClick={() => setFormState({})} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
            <Plus size={16} /> Add delivery address
          </button>
        </div>
      ) : (
        <div role="radiogroup" aria-label="Delivery address" className="mt-5 grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => {
            const selected = Number(selectedId) === Number(address.address_id);
            return (
              <div key={address.address_id} className={`relative rounded-xl border p-4 transition ${selected ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600" : "border-zinc-200 hover:border-zinc-300"}`}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="radio"
                    name="address"
                    checked={selected}
                    onChange={() => onSelect(address.address_id)}
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="min-w-0 text-sm text-zinc-700">
                    <span className="block font-semibold text-zinc-900">
                      {address.street}
                      {Number(address.is_default) === 1 && (
                        <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">Default</span>
                      )}
                    </span>
                    <span className="block">{address.city}{address.postal_code ? `, ${address.postal_code}` : ""}</span>
                    <span className="block">{address.country}</span>
                  </span>
                </label>
                <div className="mt-3 flex gap-1 pl-7">
                  <button type="button" onClick={() => setFormState({ address })} aria-label="Edit address" className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800">
                    <Pencil size={16} />
                  </button>
                  <button type="button" onClick={() => handleDelete(address)} aria-label="Delete address" className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-zinc-500 hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {formState && (
        <AddressForm
          address={formState.address}
          isFirst={addresses.length === 0}
          onSubmit={handleSave}
          onClose={() => setFormState(null)}
        />
      )}
    </section>
  );
}
