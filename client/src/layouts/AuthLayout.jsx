import { Outlet, Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">

      <header className="border-b bg-white px-6 py-5">
        <Link to="/" className="mx-auto flex max-w-6xl items-center gap-2">
          <ShoppingBag className="text-indigo-600" size={26} />

          <span className="text-xl font-bold">
            Shop<span className="text-indigo-600">Sphere</span>
          </span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Outlet />
      </main>

    </div>
  );
};

export default AuthLayout;