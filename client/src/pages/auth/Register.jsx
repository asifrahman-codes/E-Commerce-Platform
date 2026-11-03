import { Link, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useState } from "react";

import { ShoppingBag, ArrowRight } from "lucide-react";

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

  const onSubmit = async (formData) => {
    setServerError("");
    setSuccessMessage("");

    try {
      const { confirmPassword, ...userData } = formData;

      await registerUser(userData);

      setSuccessMessage(
        "Account created successfully. Please log in."
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
    <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-7 shadow-sm sm:p-9">

      <div className="mb-7 text-center">

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
          <ShoppingBag className="text-indigo-600" size={28} />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Create Account
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Join ShopSphere and start shopping.
        </p>

      </div>

      {serverError && (
        <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      {successMessage && (
        <div className="mb-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        <FormInput
          label="First Name"
          placeholder="Enter your first name"
          autoComplete="name"
          registration={register("firstName")}
          error={errors.firstName}
        />

        <FormInput
          label="Last Name"
          placeholder="Enter your last name"
          autoComplete="name"
          registration={register("lastName")}
          error={errors.lastName}
        />

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
          placeholder="At least 8 characters"
          autoComplete="new-password"
          registration={register("password")}
          error={errors.password}
        />

        <FormInput
          label="Confirm Password"
          type="password"
          placeholder="Enter password again"
          autoComplete="new-password"
          registration={register("confirmPassword")}
          error={errors.confirmPassword}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}

          {!isSubmitting && <ArrowRight size={18} />}
        </button>

      </form>

      <p className="mt-7 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Sign in
        </Link>
      </p>

    </div>
  );
};

export default Register;