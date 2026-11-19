import { useEffect, useState } from "react";

import {
    Truck,
    MapPin,
    RefreshCw
} from "lucide-react";

import adminOrderService from "../../../services/admin-order.service";

import OrderStatusBadge from "./OrderStatusBadge";


const SHIPMENT_TRANSITIONS = {

    PENDING: ["READY", "FAILED"],

    READY: ["SHIPPED", "FAILED"],

    SHIPPED: [
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "FAILED",
        "RETURNED"
    ],

    IN_TRANSIT: [
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "FAILED",
        "RETURNED"
    ],

    OUT_FOR_DELIVERY: [
        "DELIVERED",
        "FAILED",
        "RETURNED"
    ],

    FAILED: ["READY", "RETURNED"],

    DELIVERED: [],

    RETURNED: []

};


export default function ShipmentTracking({
    shipment,
    onUpdated
}) {

    const [tracking, setTracking] = useState(null);

    const [status, setStatus] = useState("");

    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");

    const [carrier, setCarrier] = useState(
        shipment.carrier || ""
    );

    const [trackingNumber, setTrackingNumber] = useState(
        shipment.tracking_number || ""
    );

    const [trackingUrl, setTrackingUrl] = useState(
        shipment.tracking_url || ""
    );

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadTracking = async () => {

        try {

            setLoading(true);

            const data =
                await adminOrderService.getShipmentTracking(
                    shipment.shipment_id
                );

            setTracking(data);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to load tracking information."
            );

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadTracking();

    }, [shipment.shipment_id]);

    const currentStatus = String(shipment.status).toUpperCase();

    const nextStatuses =
        SHIPMENT_TRANSITIONS[currentStatus] || [];

    const updateStatus = async (e) => {

        e.preventDefault();

        if (!status) {
            setError("Select a shipment status.");
            return;
        }

        try {

            setSaving(true);
            setError("");

            await adminOrderService.updateShipmentStatus(
                shipment.shipment_id,
                {
                    status,
                    location: location.trim() || null,
                    description: description.trim() || null,
                    carrier: carrier.trim() || null,
                    tracking_number: trackingNumber.trim() || null,
                    tracking_url: trackingUrl.trim() || null
                }
            );

            setStatus("");
            setLocation("");
            setDescription("");

            await onUpdated?.();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to update shipment."
            );

        } finally {

            setSaving(false);

        }

    };

    const events = tracking?.events || [];

    return (

        <section className="rounded-2xl border border-zinc-200 bg-white p-5">

            <div className="flex flex-wrap items-center justify-between gap-3">

                <div>

                    <h2 className="font-semibold text-zinc-900">
                        Shipment #{shipment.shipment_id}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                        {shipment.shipping_method_name}
                    </p>

                </div>

                <OrderStatusBadge status={shipment.status} />

            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">

                <div className="rounded-xl bg-zinc-50 p-4">

                    <p className="text-xs text-zinc-500">
                        Carrier
                    </p>

                    <p className="mt-1 font-semibold text-zinc-800">
                        {shipment.carrier || "Not assigned"}
                    </p>

                </div>

                <div className="rounded-xl bg-zinc-50 p-4">

                    <p className="text-xs text-zinc-500">
                        Tracking number
                    </p>

                    <p className="mt-1 font-semibold text-zinc-800">
                        {shipment.tracking_number || "Not assigned"}
                    </p>

                </div>

            </div>

            {shipment.tracking_url && (

                <a
                    href={shipment.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:underline"
                >
                    Open carrier tracking website
                </a>

            )}

            {error && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </p>
            )}

            {/* Tracking history */}

            <div className="mt-7">

                <div className="flex items-center justify-between">

                    <h3 className="font-semibold text-zinc-800">
                        Tracking History
                    </h3>

                    <button
                        type="button"
                        onClick={loadTracking}
                        disabled={loading}
                        className="text-indigo-600"
                    >
                        <RefreshCw
                            size={17}
                            className={loading ? "animate-spin" : ""}
                        />
                    </button>

                </div>

                <div className="mt-5 space-y-5">

                    {events.map((event, index) => (

                        <div
                            key={event.tracking_event_id || index}
                            className="flex gap-3"
                        >

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                                <Truck size={17} />
                            </div>

                            <div className="min-w-0 flex-1 border-b border-zinc-100 pb-4">

                                <OrderStatusBadge status={event.status} />

                                <p className="mt-2 text-sm font-medium text-zinc-800">
                                    {event.description || "Shipment update"}
                                </p>

                                {event.location && (
                                    <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                                        <MapPin size={13} />
                                        {event.location}
                                    </p>
                                )}

                                <p className="mt-1 text-xs text-zinc-400">
                                    {event.event_time
                                        ? new Date(event.event_time).toLocaleString()
                                        : ""}
                                </p>

                            </div>

                        </div>

                    ))}

                    {!loading && events.length === 0 && (
                        <p className="text-sm text-zinc-500">
                            No tracking events available.
                        </p>
                    )}

                </div>

            </div>

            {/* Update shipment */}

            {nextStatuses.length > 0 && (

                <form
                    onSubmit={updateStatus}
                    className="mt-7 space-y-4 border-t border-zinc-100 pt-6"
                >

                    <h3 className="font-semibold text-zinc-900">
                        Update Shipment
                    </h3>

                    <div>

                        <label className="mb-2 block text-sm font-medium">
                            New status
                        </label>

                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            required
                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm"
                        >

                            <option value="">
                                Select next status
                            </option>

                            {nextStatuses.map(value => (
                                <option key={value} value={value}>
                                    {value.replaceAll("_", " ")}
                                </option>
                            ))}

                        </select>

                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">

                        <input
                            value={carrier}
                            onChange={e => setCarrier(e.target.value)}
                            maxLength={100}
                            placeholder="Carrier"
                            className="rounded-xl border border-zinc-200 px-4 py-3 text-sm"
                        />

                        <input
                            value={trackingNumber}
                            onChange={e => setTrackingNumber(e.target.value)}
                            maxLength={150}
                            placeholder="Tracking number"
                            className="rounded-xl border border-zinc-200 px-4 py-3 text-sm"
                        />

                    </div>

                    <input
                        type="url"
                        value={trackingUrl}
                        onChange={e => setTrackingUrl(e.target.value)}
                        maxLength={500}
                        placeholder="Tracking URL"
                        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm"
                    />

                    <input
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        maxLength={255}
                        placeholder="Current location"
                        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm"
                    />

                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        maxLength={500}
                        placeholder="Tracking event description"
                        rows={3}
                        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm"
                    />

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:bg-zinc-400"
                    >
                        {saving ? "Updating..." : "Update Shipment"}
                    </button>

                </form>

            )}

        </section>

    );

}