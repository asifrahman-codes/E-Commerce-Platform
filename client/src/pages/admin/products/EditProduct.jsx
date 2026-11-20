import { useCallback, useEffect, useState } from "react";

import { Link, useLocation, useParams } from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import adminProductService from "../../../services/admin-product.service";

import ProductForm from "../../../components/admin/products/ProductForm";


export default function EditProduct() {

    const { id } = useParams();

    const location = useLocation();

    const notice = location.state?.notice || "";

    const [product, setProduct] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /*
    | Refreshes in the background, without the full-page loader, so the
    | form keeps its state while images change.
    */
    const refreshProduct = useCallback(async () => {

        try {

            const data = await adminProductService.getProductById(id);

            setProduct(data);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to load product."
            );

        }

    }, [id]);


    useEffect(() => {

        let active = true;

        const loadProduct = async () => {

            try {

                const data = await adminProductService.getProductById(id);

                if (active) setProduct(data);

            } catch (err) {

                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load product."
                    );
                }

            } finally {

                if (active) setLoading(false);

            }

        };

        loadProduct();

        return () => {
            active = false;
        };

    }, [id]);


    if (loading) {
        return <p className="p-8">Loading product...</p>;
    }


    if (error || !product) {
        return (
            <div className="rounded-xl bg-red-50 p-5 text-red-700">
                {error || "Product not found."}
            </div>
        );
    }


    return (

        <div className="mx-auto max-w-3xl space-y-6">

            <Link
                to="/admin/products"
                className="inline-flex items-center gap-2 text-sm text-zinc-500"
            >
                <ArrowLeft size={16} />
                Back to Products
            </Link>

            <div>

                <h1 className="text-2xl font-bold">
                    Edit Product
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                    Update product information and images.
                </p>

            </div>

            {notice && (
                <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                    {notice}
                </div>
            )}

            <ProductForm
                product={product}
                onRefresh={refreshProduct}
            />

        </div>

    );

}