import {
    ShoppingBag,
    CircleDollarSign,
    Users,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
    AlertTriangle
} from "lucide-react";

const icons = {
    orders: ShoppingBag,
    revenue: CircleDollarSign,
    customers: Users,
    products: Package,
    pending: Clock,
    delivered: CheckCircle,
    cancelled: XCircle,
    growth: TrendingUp,
    inventory: AlertTriangle
};

export default function AdminStatCard({
    title,
    value,
    type,
    description
}) {

    const Icon = icons[type] || Package;

    return (

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)] transition hover:border-slate-300 hover:shadow-sm">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-xs font-medium text-slate-500">
                        {title}
                    </p>

                    <h3 className="mt-2 text-[26px] font-bold tracking-tight text-slate-900">
                        {value}
                    </h3>

                    {description && (
                        <p className="mt-2 text-xs text-slate-500">
                            {description}
                        </p>
                    )}

                </div>

                <div className="rounded-xl bg-[#eaf1ec] p-3 text-[#315d47]">

                    <Icon size={23} />

                </div>

            </div>

        </div>

    );

}