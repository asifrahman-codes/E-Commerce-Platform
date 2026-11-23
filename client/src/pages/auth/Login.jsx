import { useState, useEffect } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  AlertCircle,
  ArrowRight,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";

import FormInput from "../../components/ui/FormInput";

import { loginSchema } from "../../validations/auth.validation";

import { getErrorMessage } from "../../utils/error.utils";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: location.state?.email || "",
      password: "",
    },
  });

  useEffect(() => {
    if (location.state?.email) {
      setValue("email", location.state.email);
    }
  }, [location.state?.email, setValue]);

  const onSubmit = async (credentials) => {
    setServerError("");

    try {
      const user = await login(credentials);

      const requestedPath = location.state?.from?.pathname;

      const destination =
        requestedPath ||
        (String(user.role ?? "").toLowerCase() === "admin"
          ? "/admin"
          : "/");

      navigate(destination, { replace: true });

    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  return (
    <div className="premium-enter w-full">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2.5 text-[#244b39] lg:hidden"
        aria-label="ShopSphere home"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#244b39] text-white">
          <ShieldCheck size={19} />
        </span>
        <span className="text-lg font-bold tracking-tight">ShopSphere</span>
      </Link>

      <div className="mb-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#527d65]">
          Member sign in
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#1d2822] sm:text-[2.5rem]">
          Welcome Back
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#68756c] sm:text-base">
          Sign in to continue shopping and manage your account.
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

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
          placeholder="Enter your password"
          autoComplete="current-password"
          registration={register("password")}
          error={errors.password}
          leadingIcon={LockKeyhole}
        />

        <div className="flex items-center justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-[#315d47] underline-offset-4 transition hover:text-[#244b39] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#315d47] px-5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(49,93,71,.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#244b39] hover:shadow-[0_16px_30px_rgba(49,93,71,.22)] focus-visible:ring-4 focus-visible:ring-[#527d65]/20 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>

      </form>

      <p className="mt-8 text-center text-sm text-[#68756c]">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-bold text-[#315d47] underline-offset-4 transition hover:text-[#244b39] hover:underline"
        >
          Create account
        </Link>
      </p>

    </div>
  );
};

export default Login;