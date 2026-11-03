import { useState, useEffect } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ShoppingBag, ArrowRight } from "lucide-react";

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
        (user.role?.toLowerCase() === "admin"
          ? "/admin"
          : "/account");

      navigate(destination, { replace: true });

    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-7 shadow-sm sm:p-9">

      <div className="mb-7 text-center">

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
          <ShoppingBag className="text-indigo-600" size={28} />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Welcome Back
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Sign in to continue shopping.
        </p>

      </div>

      {serverError && (
        <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        <FormInput
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          registration={register("email")}
          error={errors.email}
        />

        <FormInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          registration={register("password")}
          error={errors.password}
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}

          {!isSubmitting && <ArrowRight size={18} />}
        </button>

      </form>

      <p className="mt-7 text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Create account
        </Link>
      </p>

    </div>
  );
};

export default Login;