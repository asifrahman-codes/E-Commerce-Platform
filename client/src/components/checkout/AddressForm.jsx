import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import FormInput from "../ui/FormInput";
import { addressSchema } from "../../validations/address.validation";
import { getErrorMessage } from "../../utils/error.utils";
import useDialogFocus from "../../hooks/useDialogFocus";

export default function AddressForm({ address, isFirst, onSubmit, onClose }) {
  const [serverError, setServerError] = useState("");
  const dialogRef = useRef(null);
  useDialogFocus(dialogRef, true, onClose);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: address?.street || "",
      city: address?.city || "",
      country: address?.country || "Pakistan",
      postal_code: address?.postal_code || "",
      is_default: Boolean(address?.is_default) || isFirst,
    },
  });

  const submit = async (values) => {
    try {
      setServerError("");
      await onSubmit(values);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  const alreadyDefault = Boolean(address?.is_default) || isFirst;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-form-title"
      tabIndex={-1}
      ref={dialogRef}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-2xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl sm:max-h-[92vh] sm:max-w-lg sm:rounded-2xl sm:p-6">
        <div className="flex items-center justify-between">
          <h2 id="address-form-title" className="text-lg font-bold text-gray-900">
            {address ? "Edit address" : "Add a delivery address"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} noValidate className="mt-5 space-y-4">
          <FormInput label="Street address" autoComplete="street-address" placeholder="House 12, Street 4, Sector F-7" registration={register("street")} error={errors.street} />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="City" autoComplete="address-level2" placeholder="Islamabad" registration={register("city")} error={errors.city} />
            <FormInput label="Postal code (optional)" autoComplete="postal-code" placeholder="44000" registration={register("postal_code")} error={errors.postal_code} />
          </div>

          <FormInput label="Country" autoComplete="country-name" registration={register("country")} error={errors.country} />

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              disabled={alreadyDefault}
              {...register("is_default")}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Use as my default address
          </label>

          {serverError && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {serverError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => { reset(); onClose(); }} className="min-h-11 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="min-h-11 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Saving..." : "Save address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
