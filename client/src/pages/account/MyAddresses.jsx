import { useCallback, useEffect, useState } from "react";
import { Plus, MapPin } from "lucide-react";

import {
    getMyAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
} from "../../services/account.service";

import AddressCard from "../../components/account/AddressCard";
import AddressForm from "../../components/account/AddressForm";

export default function MyAddresses() {
    const [addresses, setAddresses] = useState([]);
    const [editingAddress, setEditingAddress] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadAddresses = useCallback(async () => {
        try {
            setError("");

            const data = await getMyAddresses();

            setAddresses(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load addresses."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAddresses();
    }, [loadAddresses]);

    const handleSubmit = async (formData) => {
        setSaving(true);
        setError("");
        setMessage("");

        try {
            if (editingAddress) {
                await updateAddress(
                    editingAddress.address_id,
                    formData
                );

                setMessage("Address updated successfully.");
            } else {
                await createAddress(formData);

                setMessage("Address added successfully.");
            }

            setShowForm(false);
            setEditingAddress(null);

            await loadAddresses();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save address."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (address) => {
        setEditingAddress(address);
        setShowForm(true);
        setMessage("");
        setError("");
    };

    const handleDelete = async (addressId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this address?"
        );

        if (!confirmed) return;

        setError("");
        setMessage("");

        try {
            await deleteAddress(addressId);

            setMessage("Address deleted successfully.");

            await loadAddresses();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete address."
            );
        }
    };

    const handleSetDefault = async (addressId) => {
        setError("");
        setMessage("");

        try {
            await setDefaultAddress(addressId);

            setMessage("Default address updated.");

            await loadAddresses();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update default address."
            );
        }
    };

    const openNewAddressForm = () => {
        setEditingAddress(null);
        setShowForm(true);
        setMessage("");
        setError("");
    };

    const closeForm = () => {
        setEditingAddress(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="rounded-2xl bg-white p-6">
                Loading addresses...
            </div>
        );
    }

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-zinc-900">
                        My Addresses
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                        Manage your delivery addresses.
                    </p>
                </div>

                {!showForm && (
                    <button
                        onClick={openNewAddressForm}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        <Plus size={17} />
                        Add Address
                    </button>
                )}
            </div>

            {message && (
                <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    {message}
                </p>
            )}

            {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            {showForm && (
                <AddressForm
                    address={editingAddress}
                    onSubmit={handleSubmit}
                    onCancel={closeForm}
                    loading={saving}
                />
            )}

            {!showForm && addresses.length === 0 && (
                <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
                    <MapPin
                        size={35}
                        className="mx-auto text-zinc-400"
                    />

                    <h3 className="mt-4 font-semibold text-zinc-900">
                        No addresses saved
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                        Add an address to make checkout easier.
                    </p>

                    <button
                        onClick={openNewAddressForm}
                        className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        Add Your First Address
                    </button>
                </div>
            )}

            {!showForm && addresses.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                    {addresses.map((address) => (
                        <AddressCard
                            key={address.address_id}
                            address={address}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onSetDefault={handleSetDefault}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}