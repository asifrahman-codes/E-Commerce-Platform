import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const FormInput = ({
  label,
  type = "text",
  placeholder,
  error,
  registration,
  autoComplete,
  leadingIcon: LeadingIcon,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  const inputType =
    isPassword && showPassword ? "text" : type;

  return (
    <div className="w-full">

      <label
        htmlFor={registration?.name}
        className="mb-2 block text-sm font-semibold text-[#27342e]"
      >
        {label}
      </label>

      <div className="relative">

        <input
          {...registration}
          id={registration?.name}
          type={inputType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          className={`min-h-12 w-full rounded-xl border bg-white px-4 py-3 text-base text-[#1d2822] outline-none transition placeholder:text-[#9aa59e] sm:text-sm
            ${LeadingIcon ? "pl-11" : ""}
            ${isPassword ? "pr-11" : ""}
            ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                : "border-[#dfe5df] hover:border-[#b8c7bd] focus:border-[#527d65] focus:ring-4 focus:ring-[#527d65]/10"
            }`}
        />

        {LeadingIcon && (
          <LeadingIcon
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#829187]"
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-pressed={showPassword}
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