import { Link, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useState } from "react";

import {
  AlertCircle,
  ArrowRight,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";

import FormInput from "../../components/ui/FormInput";

import { registerSchema } from "../../validations/auth.validation";

import { getErrorMessage } from "../../utils/error.utils";

const Register = () => {
  const navigate = useNavigate();

  const { register: registerUser } = useAuth();

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),

    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password") || "";
  const passwordLength = passwordValue.length;
  const passwordStrength = passwordLength === 0
    ? 0
    : passwordLength >= 12
      ? 3
      : passwordLength >= 8
        ? 2
        : 1;

  const onSubmit = async (formData) => {
    setServerError("");
    setSuccessMessage("");

    try {
      const { confirmPassword, ...userData } = formData;

      await registerUser(userData);

      setSuccessMessage(
        "If registration can be completed for this email, you can now sign in. If an account already exists, use your existing password."
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { email: formData.email },
        });
      }, 1000);

    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  return (
    <div className="premium-enter w-full">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2.5 text-[#244b39] lg:hidden"
        aria-label="ShopSphere home"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#244b39] text-white">
          <ShieldCheck size={19} />
        </span>
        <span className="text-lg font-bold tracking-tight">ShopSphere</span>
      </Link>

      <div className="mb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#527d65]">
          New member
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#1d2822] sm:text-[2.5rem]">
          Create Your Account
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#68756c]">
          Join ShopSphere and start exploring.
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="First Name"
            placeholder="First name"
            autoComplete="given-name"
            registration={register("firstName")}
            error={errors.firstName}
            leadingIcon={UserRound}
          />

          <FormInput
            label="Last Name"
            placeholder="Last name"
            autoComplete="family-name"
            registration={register("lastName")}
            error={errors.lastName}
            leadingIcon={UserRound}
          />
        </div>

        <FormInput
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          registration={register("email")}
          error={errors.email}
          leadingIcon={Mail}
        />

        <FormInput
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          registration={register("password")}
          error={errors.password}
          leadingIcon={LockKeyhole}
        />

        {passwordLength > 0 && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((level) => (
                <span
                  key={level}
                  className={`h-1.5 rounded-full ${
                    passwordStrength >= level
                      ? passwordStrength === 1
                        ? "bg-amber-500"
                        : passwordStrength === 2
                          ? "bg-[#527d65]"
                          : "bg-emerald-600"
                      : "bg-[#e4e9e3]"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-[#68756c]">
              {passwordStrength === 1
                ? "Keep going — use at least 8 characters."
                : passwordStrength === 2
                  ? "Good password strength."
                  : "Strong password."}
            </p>
          </div>
        )}

        <FormInput
          label="Confirm Password"
          type="password"
          placeholder="Enter password again"
          autoComplete="new-password"
          registration={register("confirmPassword")}
          error={errors.confirmPassword}
          leadingIcon={LockKeyhole}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#315d47] px-5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(49,93,71,.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#244b39] hover:shadow-[0_16px_30px_rgba(49,93,71,.22)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>

      </form>

      <p className="mt-6 text-center text-sm text-[#68756c]">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-bold text-[#315d47] underline-offset-4 transition hover:text-[#244b39] hover:underline"
        >
          Sign in
        </Link>
      </p>

    </div>
  );
};

export default Register;