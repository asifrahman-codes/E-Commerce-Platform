import { Link } from "react-router-dom";
import { Lock, ShieldCheck, AlertTriangle } from "lucide-react";

import DeactivateAccountModal from "../../components/account/DeactivateAccountModal";

export default function Security() {
  return (
    <div className="space-y-6">
      {/* Password section */}
      <div className="shop-panel p-5 sm:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="rounded-lg bg-indigo-50 p-2">
            <Lock size={20} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Password</h2>
            <p className="text-sm text-zinc-500">
              Keep your account secure with a strong password.
            </p>
          </div>
        </div>

        <p className="text-sm text-zinc-600 mb-4">
          Changing your password will sign you out of all active sessions.
        </p>

        <Link
          to="/account/password"
          className="shop-button shop-button-secondary inline-flex"
        >
          Change Password
        </Link>
      </div>

      {/* Account security overview */}
      <div className="shop-panel p-5 sm:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="rounded-lg bg-green-50 p-2">
            <ShieldCheck size={20} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Account Security
            </h2>
            <p className="text-sm text-zinc-500">
              Security tips and account protection information.
            </p>
          </div>
        </div>

        <ul className="space-y-3 text-sm text-zinc-600">
          <li className="flex items-start gap-2">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-green-500" />
            Use a strong, unique password at least 8 characters long.
          </li>
          <li className="flex items-start gap-2">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-green-500" />
            Never share your login credentials with anyone.
          </li>
          <li className="flex items-start gap-2">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-green-500" />
            Log out from shared or public devices after use.
          </li>
          <li className="flex items-start gap-2">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-green-500" />
            Contact support immediately if you notice any suspicious activity.
          </li>
        </ul>
      </div>

      {/* Danger zone */}
      <div className="shop-panel border-red-200 p-5 sm:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="rounded-lg bg-red-50 p-2">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-red-700">
              Danger Zone
            </h2>
            <p className="text-sm text-zinc-500">
              Irreversible account actions. Proceed with caution.
            </p>
          </div>
        </div>

        <p className="mb-5 text-sm text-zinc-600">
          Deactivating your account will prevent you from logging in. Your data
          will be retained but your account will be inaccessible. You will need
          to contact support to reactivate it.
        </p>

        <DeactivateAccountModal />
      </div>
    </div>
  );
}
