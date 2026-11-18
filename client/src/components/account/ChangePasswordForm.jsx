import { useState } from "react";
import { LockKeyhole } from "lucide-react";

import { changeMyPassword } from "../../services/account.service";

const initialForm = {
    current_password: "",
    new_password: "",
    confirm_password: "",
};

export default function ChangePasswordForm() {
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        if (form.new_password !== form.confirm_password) {
            setError("New passwords do not match.");
            return;
        }

        if (form.new_password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            await changeMyPassword(form);

            setForm(initialForm);
            setMessage("Your password has been changed successfully.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to change password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-zinc-900">
                    Change Password
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                    Choose a strong password to protect your account.
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

            <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
                {[
                    {
                        name: "current_password",
                        label: "Current Password",
                    },
                    {
                        name: "new_password",
                        label: "New Password",
                    },
                    {
                        name: "confirm_password",
                        label: "Confirm New Password",
                    },
                ].map((field) => (
                    <div key={field.name}>
                        <label className="mb-2 block text-sm font-medium text-zinc-700">
                            {field.label}
                        </label>

                        <input
                            type="password"
                            name={field.name}
                            value={form[field.name]}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                            className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>
                ))}

                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                    <LockKeyhole size={17} />
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </form>
        </section>
    );
}