import { Link } from "react-router-dom";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";

const ForgotPassword = () => {
  return (
    <div className="premium-enter w-full">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2.5 text-[#244b39] lg:hidden"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#244b39] text-white">
          <ShieldCheck size={19} />
        </span>
        <span className="text-lg font-bold">ShopSphere</span>
      </Link>

      <div className="mb-8">
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf3ef] text-[#315d47]">
          <LockKeyhole size={25} />
        </span>
        <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#1d2822] sm:text-[2.5rem]">
          Forgot Password?
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#68756c] sm:text-base">
          Password recovery will be available once the backend
          email verification and reset-token workflow is connected.
        </p>
      </div>

      <Link
        to="/login"
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#315d47] px-5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(49,93,71,.18)] transition hover:-translate-y-0.5 hover:bg-[#244b39]"
      >
        <ArrowLeft size={18} />
        Back to Login
      </Link>

    </div>
  );
};

export default ForgotPassword;