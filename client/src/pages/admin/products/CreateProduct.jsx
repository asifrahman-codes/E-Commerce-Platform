import { Link } from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import ProductForm from "../../../components/admin/products/ProductForm";

export default function CreateProduct() {

    return (

        <div className="mx-auto max-w-3xl space-y-6">

            <Link
                to="/admin/products"
                className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-indigo-600"
            >
                <ArrowLeft size={16} />
                Back to Products
            </Link>

            <div>

                <h1 className="text-2xl font-bold">
                    Create Product
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                    Add a new product to your store.
                </p>

            </div>

            <ProductForm />

        </div>

    );

}