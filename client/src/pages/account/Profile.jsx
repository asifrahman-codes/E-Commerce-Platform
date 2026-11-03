import { Link } from "react-router-dom";
import { UserRound, Mail, ShieldCheck, ShoppingBag } from "lucide-react";

import useAuth from "../../hooks/useAuth";

const Profile = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (!user) return null;

  return (
    <section className="container-custom py-12">

      <div className="mx-auto max-w-3xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Account
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your account information.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">

          <div className="mb-8 flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
              <UserRound size={32} className="text-indigo-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {user.name || user.first_name || "Customer"}
              </h2>

              <p className="text-sm text-gray-500">
                {user.email}
              </p>
            </div>

          </div>

          <div className="space-y-5">

            <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
              <UserRound className="text-gray-400" />

              <div>
                <p className="text-xs text-gray-400">Full Name</p>
                <p className="font-medium text-gray-800">
                  {user.name || user.first_name || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
              <Mail className="text-gray-400" />

              <div>
                <p className="text-xs text-gray-400">Email Address</p>
                <p className="font-medium text-gray-800">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ShieldCheck className="text-gray-400" />

              <div>
                <p className="text-xs text-gray-400">Account Role</p>
                <p className="font-medium capitalize text-gray-800">
                  {user.role}
                </p>
              </div>
            </div>

          </div>

          <div className="mt-8 flex flex-wrap gap-3">

            <Link
              to="/orders"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <ShoppingBag size={17} />
              My Orders
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Logout
            </button>

          </div>

        </div>

      </div>

    </section>
  );
};

export default Profile;