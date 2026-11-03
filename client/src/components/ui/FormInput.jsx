import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const FormInput = ({
  label,
  type = "text",
  placeholder,
  error,
  registration,
  autoComplete,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  const inputType =
    isPassword && showPassword ? "text" : type;

  return (
    <div className="w-full">

      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">

        <input
          {...registration}
          type={inputType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition
            ${
              error
                ? "border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            aria-label={
              showPassword ? "Hide password" : "Show password"
            }
          >
            {showPassword ? (
              <EyeOff size={19} />
            ) : (
              <Eye size={19} />
            )}
          </button>
        )}

      </div>

      {error && (
        <p className="mt-1.5 text-xs text-red-500">
          {error.message}
        </p>
      )}

    </div>
  );
};

export default FormInput;