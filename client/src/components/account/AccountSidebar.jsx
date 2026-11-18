import { NavLink } from "react-router-dom";

import {
    UserRound,
    MapPin,
    LockKeyhole,
    ShoppingBag,
} from "lucide-react";

const links = [
    {
        label: "My Profile",
        path: "/account",
        icon: UserRound,
        end: true,
    },
    {
        label: "My Addresses",
        path: "/account/addresses",
        icon: MapPin,
    },
    {
        label: "Change Password",
        path: "/account/password",
        icon: LockKeyhole,
    },
    {
        label: "My Orders",
        path: "/orders",
        icon: ShoppingBag,
    },
];

export default function AccountSidebar() {
    return (
        <aside className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 px-3 text-lg font-semibold text-zinc-900">
                My Account
            </h2>

            <nav className="space-y-1">
                {links.map(({ label, path, icon: Icon, end }) => (
                    <NavLink
                        key={path}
                        to={path}
                        end={end}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                                isActive
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                            }`
                        }
                    >
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}