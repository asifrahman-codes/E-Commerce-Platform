import { Outlet } from "react-router-dom";

import AccountSidebar from "../../components/account/AccountSidebar";

export default function AccountLayout() {
    return (
        <div className="premium-page">
            <div className="container-custom py-8 sm:py-12">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight text-ink">
                        My Account
                    </h1>

                    <p className="mt-1 text-sm text-muted">
                        Manage your profile, addresses and account security.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
                    <AccountSidebar />

                    <div className="min-w-0">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}