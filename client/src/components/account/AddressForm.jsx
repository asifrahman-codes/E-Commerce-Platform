import { useEffect, useState } from "react";
import { X } from "lucide-react";

const initialForm = {
    recipient_name: "",
    phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Pakistan",
    is_default: false,
};

export default function AddressForm({
    address,
    onSubmit,
    onCancel,
    loading,
}) {
    const [form, setForm] = useState(initialForm);

    useEffect(() => {
        if (address) {
            setForm({
                recipient_name: address.recipient_name || "",
                phone: address.phone || "",
                address_line_1: address.address_line_1 || "",
                address_line_2: address.address_line_2 || "",
                city: address.city || "",
                state: address.state || "",
                postal_code: address.postal_code || "",
                country: address.country || "Pakistan",
                is_default: Boolean(address.is_default),
            });
        } else {
            setForm(initialForm);
        }
    }, [address]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(form);
    };

    const fields = [
        {
            name: "recipient_name",
            label: "Recipient Name",
            required: true,
        },
        {
            name: "phone",
            label: "Phone Number",
            required: true,
        },
        {
            name: "address_line_1",
            label: "Address Line 1",
            required: true,
        },
        {
            name: "address_line_2",
            label: "Address Line 2",
        },
        {
            name: "city",
            label: "City",
            required: true,
        },
        {
            name: "state",
            label: "State / Province",
        },
        {
            name: "postal_code",
            label: "Postal Code",
        },
        {
            name: "country",
            label: "Country",
            required: true,
        },
    ];

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-900">
                    {address ? "Edit Address" : "Add New Address"}
                </h3>

                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
                    aria-label="Close address form"
                >
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    {fields.map((field) => (
                        <div
                            key={field.name}
                            className={
                                field.name.includes("address_line")
                                    ? "sm:col-span-2"
                                    : ""
                            }
                        >
                            <label className="mb-2 block text-sm font-medium text-zinc-700">
                                {field.label}
                            </label>

                            <input
                                name={field.name}
                                value={form[field.name]}
                                onChange={handleChange}
                                required={Boolean(field.required)}
                                maxLength={255}
                                className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                    ))}
                </div>

                {!address && (
                    <label className="flex items-center gap-2 text-sm text-zinc-700">
                        <input
                            type="checkbox"
                            name="is_default"
                            checked={form.is_default}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-zinc-300 text-indigo-600"
                        />
                        Set as default address
                    </label>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {loading
                            ? "Saving..."
                            : address
                                ? "Update Address"
                                : "Save Address"}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}