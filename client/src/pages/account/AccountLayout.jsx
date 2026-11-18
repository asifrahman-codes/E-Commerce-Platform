import { Outlet } from "react-router-dom";

import AccountSidebar from "../../components/account/AccountSidebar";

export default function AccountLayout() {
    return (
        <div className="min-h-screen bg-zinc-50">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900">
                        My Account
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500">
                        Manage your profile, addresses and account security.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
                    <AccountSidebar />

                    <main className="min-w-0">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}