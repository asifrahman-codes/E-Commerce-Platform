import { useEffect, useState } from "react";

import adminOrderService from "../../../services/admin-order.service";

export default function ShipmentForm({
    order,
    onCreated
}) {

    const [methods, setMethods] = useState([]);

    const [form, setForm] = useState({
        shipping_method_id: "",
        carrier: "",
        tracking_number: "",
        tracking_url: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {

        let active = true;

        const loadMethods = async () => {

            try {

                const data =
                    await adminOrderService.getShippingMethods();

                if (active) {
                    setMethods(Array.isArray(data) ? data : []);
                }

            } catch (err) {

                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load shipping methods."
                    );
                }

            }

        };

        loadMethods();

        return () => {
            active = false;
        };

    }, []);

    const handleChange = (e) => {

        setForm(previous => ({
            ...previous,
            [e.target.name]: e.target.value
        }));

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!form.shipping_method_id) {
            setError("Please select a shipping method.");
            return;
        }

        try {

            setLoading(true);
            setError("");

            await adminOrderService.createShipment({

                order_id: Number(order.order_id),

                shipping_method_id: Number(
                    form.shipping_method_id
                ),

                carrier: form.carrier.trim() || null,

                tracking_number:
                    form.tracking_number.trim() || null,

                tracking_url:
                    form.tracking_url.trim() || null

            });

            await onCreated?.();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to create shipment."
            );

        } finally {

            setLoading(false);

        }

    };

    if (String(order.payment_status).toUpperCase() !== "PAID") {

        return (

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                This order must be paid before a shipment can be created.
            </div>

        );

    }

    if (
        ["CANCELLED", "REFUNDED"].includes(
            String(order.status).toUpperCase()
        )
    ) {

        return null;

    }

    return (

        <section className="rounded-2xl border border-zinc-200 bg-white p-5">

            <h2 className="font-semibold text-zinc-900">
                Create Shipment
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
                Assign a shipping method and tracking information.
            </p>

            {error && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </p>
            )}

            <form
                onSubmit={handleSubmit}
                className="mt-5 space-y-4"
            >

                <div>

                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                        Shipping Method
                    </label>

                    <select
                        name="shipping_method_id"
                        value={form.shipping_method_id}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm"
                    >

                        <option value="">
                            Select shipping method
                        </option>

                        {methods.map(method => (

                            <option
                                key={method.shipping_method_id}
                                value={method.shipping_method_id}
                            >
                                {method.name} ({method.code})
                            </option>

                        ))}

                    </select>

                </div>

                <div>

                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                        Carrier
                    </label>

                    <input
                        name="carrier"
                        value={form.carrier}
                        onChange={handleChange}
                        maxLength={100}
                        placeholder="e.g. TCS, Leopards"
                        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm"
                    />

                </div>

                <div>

                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                        Tracking Number
                    </label>

                    <input
                        name="tracking_number"
                        value={form.tracking_number}
                        onChange={handleChange}
                        maxLength={150}
                        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm"
                    />

                </div>

                <div>

                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                        Tracking URL
                    </label>

                    <input
                        type="url"
                        name="tracking_url"
                        value={form.tracking_url}
                        onChange={handleChange}
                        maxLength={500}
                        placeholder="https://..."
                        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm"
                    />

                </div>

                <button
                    type="submit"
                    disabled={loading || methods.length === 0}
                    className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
                >
                    {loading ? "Creating..." : "Create Shipment"}
                </button>

            </form>

        </section>

    );

}