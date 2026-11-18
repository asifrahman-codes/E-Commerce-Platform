import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import {
    getMyProfile,
    updateMyProfile,
} from "../../services/account.service";

export default function ProfileForm() {
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const user = await getMyProfile();

                setForm({
                    first_name: user.first_name || "",
                    last_name: user.last_name || "",
                    email: user.email || "",
                });
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load your profile."
                );
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");
        setSaving(true);

        try {
            const user = await updateMyProfile({
                first_name: form.first_name,
                last_name: form.last_name,
            });

            setForm((previous) => ({
                ...previous,
                first_name: user.first_name,
                last_name: user.last_name,
            }));

            setMessage("Your profile has been updated.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update your profile."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="rounded-2xl bg-white p-6">Loading profile...</div>;
    }

    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-zinc-900">
                    Personal Information
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                    Update your personal details.
                </p>
            </div>

            {message && (
                <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    {message}
                </p>
            )}

            {error && (
                <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-700">
                            First Name
                        </label>

                        <input
                            name="first_name"
                            value={form.first_name}
                            onChange={handleChange}
                            required
                            maxLength={100}
                            className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-700">
                            Last Name
                        </label>

                        <input
                            name="last_name"
                            value={form.last_name}
                            onChange={handleChange}
                            required
                            maxLength={100}
                            className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                        Email Address
                    </label>

                    <input
                        type="email"
                        value={form.email}
                        disabled
                        className="w-full cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-zinc-500"
                    />

                    <p className="mt-1 text-xs text-zinc-500">
                        Email editing is not enabled in this version.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Save size={17} />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </section>
    );
}