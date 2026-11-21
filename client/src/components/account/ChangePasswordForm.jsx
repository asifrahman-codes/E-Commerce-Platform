import { useState } from "react";
import { Lock, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";

import { changeMyPassword } from "../../services/account.service";

export default function ChangePasswordForm() {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const toggleVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.current_password || !form.new_password || !form.confirm_password) {
      setError("All fields are required.");
      return;
    }

    if (form.new_password.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (form.new_password !== form.confirm_password) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await changeMyPassword(form);

      setSuccess("Password changed successfully.");
      setForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to change password."
      );
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({ name, label, field, placeholder }) => (
    <div>
      <label htmlFor={`password-${field}`} className="mb-1.5 block text-sm font-medium text-zinc-700">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPasswords[field] ? "text" : "password"}
          id={`password-${field}`}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete={name === "current_password" ? "current-password" : "new-password"}
          className="shop-input min-h-11 px-4 py-3 pr-12 text-base sm:text-sm"
        />
        <button
          type="button"
          onClick={() => toggleVisibility(field)}
          className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center text-zinc-400 hover:text-zinc-600"
        >
          {showPasswords[field] ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="shop-panel space-y-5 p-5 sm:p-8">
      <PasswordInput
        name="current_password"
        label="Current Password"
        field="current"
        placeholder="Enter current password"
      />

      <PasswordInput
        name="new_password"
        label="New Password"
        field="new"
        placeholder="Enter new password (min 8 characters)"
      />

      <PasswordInput
        name="confirm_password"
        label="Confirm New Password"
        field="confirm"
        placeholder="Re-enter new password"
      />

      {form.new_password && (
        <div className="space-y-1.5">
          {[
            { ok: form.new_password.length >= 8, text: "At least 8 characters" },
            {
              ok: form.confirm_password && form.new_password === form.confirm_password,
              text: "Passwords match",
            },
          ].map((rule) => (
            <p
              key={rule.text}
              className={`flex items-center gap-2 text-xs ${
                rule.ok ? "text-green-600" : "text-zinc-400"
              }`}
            >
              <CheckCircle size={14} />
              {rule.text}
            </p>
          ))}
        </div>
      )}

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
          <Lock size={16} />
        )}
        {loading ? "Changing..." : "Change Password"}
      </button>
    </form>
  );
}
