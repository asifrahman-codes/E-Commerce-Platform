import { Link } from "react-router-dom";
import { ArrowLeft, LockKeyhole } from "lucide-react";

const ForgotPassword = () => {
  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">

      <div className="mb-6 text-center">

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
          <LockKeyhole size={26} className="text-indigo-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Forgot Password?
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          Password recovery will be available once the backend
          email verification and reset-token workflow is connected.
        </p>

      </div>

      <Link
        to="/login"
        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700"
      >
        <ArrowLeft size={18} />
        Back to Login
      </Link>

    </div>
  );
};

export default ForgotPassword;