import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";

import { updateMyProfile } from "../../services/account.service";

export default function ProfileForm({ user, onUpdate }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("First name and last name are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const updated = await updateMyProfile(form);
      await onUpdate?.(updated);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="shop-panel space-y-5 p-5 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-first-name" className="mb-1.5 block text-sm font-medium text-zinc-700">
            First Name
          </label>
          <input
            type="text"
            id="profile-first-name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            maxLength={100}
            className="shop-input min-h-11 px-4 py-3 text-base sm:text-sm"
            placeholder="First name"
          />
        </div>

        <div>
          <label htmlFor="profile-last-name" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Last Name
          </label>
          <input
            type="text"
            id="profile-last-name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            maxLength={100}
            className="shop-input min-h-11 px-4 py-3 text-base sm:text-sm"
            placeholder="Last name"
          />
        </div>
      </div>

      <div>
        <label htmlFor="profile-phone" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Phone Number
        </label>
        <input
          type="tel"
          id="profile-phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          maxLength={20}
          className="shop-input min-h-11 px-4 py-3 text-base sm:text-sm"
          placeholder="+1 (555) 000-0000"
        />
      </div>

      <div>
        <label htmlFor="profile-email" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Email Address
        </label>
        <input
          type="email"
          id="profile-email"
          value={user?.email || ""}
          disabled
          className="min-h-11 w-full cursor-not-allowed rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-base text-zinc-500 sm:text-sm"
        />
        <p className="mt-1 text-xs text-zinc-400">
          Email address cannot be changed.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-lg bg-green-50 px-4 py-2.5 text-sm text-green-600">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="shop-button shop-button-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Save size={16} />
        )}
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
