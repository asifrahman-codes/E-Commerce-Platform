import {
    ShoppingBag,
    DollarSign,
    Users,
    Package,
    Clock,
    CheckCircle,
    XCircle
} from "lucide-react";

const icons = {
    orders: ShoppingBag,
    revenue: DollarSign,
    customers: Users,
    products: Package,
    pending: Clock,
    delivered: CheckCircle,
    cancelled: XCircle
};

export default function AdminStatCard({
    title,
    value,
    type,
    description
}) {

    const Icon = icons[type] || Package;

    return (

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-sm font-medium text-zinc-500">
                        {title}
                    </p>

                    <h3 className="mt-3 text-2xl font-bold text-zinc-900">
                        {value}
                    </h3>

                    {description && (
                        <p className="mt-2 text-xs text-zinc-500">
                            {description}
                        </p>
                    )}

                </div>

                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">

                    <Icon size={23} />

                </div>

            </div>

        </div>

    );

}