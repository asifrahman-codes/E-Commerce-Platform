import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Check,
  Package,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

const AuthLayout = () => {
  const { pathname } = useLocation();
  const isRegister = pathname === "/register";
  const isForgot = pathname === "/forgot-password";

  const headline = isRegister
    ? "Discover a better way to shop."
    : isForgot
      ? "We’ll help you get back in."
      : "Your next favorite find is just a click away.";

  const description = isRegister
    ? "Create your ShopSphere account to discover thoughtful products, track orders, and enjoy a smoother shopping experience."
    : isForgot
      ? "Secure account recovery is part of a safer and more convenient shopping experience."
      : "Discover considered essentials, track every order, and enjoy a shopping experience designed around you.";

  return (
    <div className="min-h-[100dvh] bg-[#f5f7f3] lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(480px,0.92fr)]">
      <aside className="relative hidden overflow-hidden bg-[#173727] lg:flex lg:flex-col">
        <div className="absolute inset-0 opacity-80">
          <div className="absolute -left-28 -top-28 h-96 w-96 rounded-full bg-[#527d65]/30 blur-3xl" />
          <div className="absolute -bottom-36 right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-[#a0bea9]/20 blur-3xl" />
          <div className="absolute left-[16%] top-[38%] h-32 w-32 rounded-full border border-white/10" />
          <div className="absolute left-[22%] top-[42%] h-56 w-56 rounded-full border border-white/[0.07]" />
        </div>

        <div className="relative z-10 flex h-full flex-col px-10 py-5 xl:px-14 xl:py-12">
          <Link
            to="/"
            className="flex w-fit items-center gap-3 text-white"
            aria-label="ShopSphere home"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#244b39] shadow-[0_12px_30px_rgba(0,0,0,.12)]">
              <ShoppingBag size={21} strokeWidth={2} />
            </span>
            <span className="text-xl font-bold tracking-tight">ShopSphere</span>
          </Link>

          <div className="my-auto max-w-[590px] -translate-y-2 pb-10 pt-3">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-2 text-xs font-semibold text-[#dbe8df] backdrop-blur">
              <ShieldCheck size={15} />
              Secure, considered shopping
            </div>

            <h1 className="max-w-[560px] text-[clamp(3rem,5vw,5.25rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-white">
              {headline}
            </h1>

            <p className="mt-7 max-w-[520px] text-base leading-7 text-[#d7e3dc] xl:text-lg">
              {description}
            </p>

            <div className="mt-10 grid max-w-[560px] grid-cols-3 gap-3">
              {[
                { icon: Package, label: "Curated finds" },
                { icon: Truck, label: "Reliable delivery" },
                { icon: ShieldCheck, label: "Secure checkout" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-4 text-[#edf4ef] backdrop-blur"
                >
                  <Icon size={18} className="mb-3 text-[#bcd0c2]" />
                  <p className="text-xs font-semibold leading-5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-[#bdd0c4]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
              <Check size={14} />
            </span>
            Trusted for everyday shopping
          </div>
        </div>
      </aside>

      <main className="flex min-h-[100dvh] items-center justify-center px-5 py-8 sm:px-8 lg:overflow-y-auto lg:px-10 xl:px-16">
        <div className="w-full max-w-[480px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;