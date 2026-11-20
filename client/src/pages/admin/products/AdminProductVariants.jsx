import { useParams, Link } from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import VariantManagement from "../../../components/products/admin/VariantManagement";

export default function AdminProductVariants() {

    const { id } = useParams();

    return (

        <div className="space-y-6">

            <Link
                to="/admin/products"
                className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-indigo-600"
            >
                <ArrowLeft size={16} />
                Back to Products
            </Link>

            <div>

                <h1 className="text-2xl font-bold">
                    Product Variants
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                    Manage SKUs, sizes, colors, prices and stock.
                </p>

            </div>

            <VariantManagement productId={id} />

        </div>

    );

}