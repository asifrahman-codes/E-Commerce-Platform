import {
    TrendingUp,
    TrendingDown
} from "lucide-react";


export default function StatCard({
    title,
    value,
    icon: Icon,
    description,
    currency = false,
    color = "indigo"
}) {

    const colors = {

        indigo: "bg-indigo-50 text-indigo-600",

        green: "bg-emerald-50 text-emerald-600",

        amber: "bg-amber-50 text-amber-600",

        red: "bg-red-50 text-red-600"

    };

    const formattedValue = currency
        ? `Rs. ${Number(value || 0).toLocaleString("en-PK", {
            maximumFractionDigits: 2
        })}`
        : Number(value || 0).toLocaleString("en-PK");


    return (

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:shadow-md">

            <div className="flex items-start justify-between gap-3">

                <div>

                    <p className="text-sm font-medium text-zinc-500">
                        {title}
                    </p>

                    <h3 className="mt-3 text-2xl font-bold text-zinc-900">
                        {formattedValue}
                    </h3>

                    {description && (
                        <p className="mt-2 text-xs text-zinc-500">
                            {description}
                        </p>
                    )}

                </div>


                <div className={`rounded-xl p-3 ${colors[color] || colors.indigo}`}>

                    {Icon && <Icon size={23} />}

                </div>

            </div>

        </div>

    );

}