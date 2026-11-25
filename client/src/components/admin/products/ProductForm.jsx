import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import adminProductService from "../../../services/admin-product.service";

import ProductImagePicker from "./ProductImagePicker";
import ProductImageGallery from "./ProductImageGallery";

import api from "../../../services/api";

const MAX_IMAGES_PER_PRODUCT = 10;
const MAX_IMAGES_PER_UPLOAD = 5;

const unwrap = (response) => {
    return response?.data?.data ?? response?.data ?? response;
};

const toList = (data, key) => {

    if (Array.isArray(data)) return data;

    return data?.items || data?.[key] || [];

};

export default function ProductForm({
    product = null,
    onRefresh
}) {

    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);

    const [brands, setBrands] = useState([]);

    const [newImages, setNewImages] = useState([]);

    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(null);

    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        slug: "",
        category_id: "",
        brand_id: "",
        description: "",
        base_price: "",
        status: "ACTIVE"
    });

    const existingImages = product?.images || [];

    const remainingSlots = Math.max(
        0,
        MAX_IMAGES_PER_PRODUCT - existingImages.length
    );

    const pickerLimit = Math.min(MAX_IMAGES_PER_UPLOAD, remainingSlots);


    /*
    | Reset the fields only when a different product is loaded, so an
    | image refresh never discards unsaved text edits.
    */
    useEffect(() => {

        if (product) {

            setForm({
                name: product.name || "",
                slug: product.slug || "",
                category_id: String(product.category_id || ""),
                brand_id: String(product.brand_id || ""),
                description: product.description || "",
                base_price: product.base_price || "",
                status: product.status || "ACTIVE"
            });

        }

    }, [product?.product_id]);


    useEffect(() => {

        const loadOptions = async () => {

            try {

                const [categoryResponse, brandResponse] =
                    await Promise.all([
                        api.get("/categories"),
                        api.get("/brands")
                    ]);

                setCategories(
                    toList(unwrap(categoryResponse), "categories")
                );

                setBrands(
                    toList(unwrap(brandResponse), "brands")
                );

            } catch (err) {

                setError(
                    "Unable to load categories or brands. Check their API endpoints."
                );

            }

        };

        loadOptions();

    }, []);


    const updateField = (e) => {

        setForm(previous => ({
            ...previous,
            [e.target.name]: e.target.value
        }));

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);
            setError("");

            const payload = {
                ...form,
                category_id: Number(form.category_id),
                brand_id: form.brand_id
                    ? Number(form.brand_id)
                    : null,
                base_price: Number(form.base_price)
            };

            let productId;

            if (product) {

                await adminProductService.updateProduct(
                    product.product_id,
                    payload
                );

                productId = product.product_id;

            } else {

                const created =
                    await adminProductService.createProduct(payload);

                productId = created.product_id;

            }

            if (newImages.length > 0) {

                try {

                    setUploadProgress(0);
                    await adminProductService.uploadProductImages(
                        productId,
                        newImages,
                        (progressEvent) => {
                            if (progressEvent.total) {
                                setUploadProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
                            }
                        }
                    );

                } catch (uploadError) {

                    const reason =
                        uploadError.response?.data?.message ||
                        "Image upload failed.";

                    if (product) {

                        setError(
                            `Product saved, but the images were not uploaded: ${reason}`
                        );

                        await onRefresh?.();

                        return;

                    }

                    navigate(
                        `/admin/products/${productId}/edit`,
                        {
                            replace: true,
                            state: {
                                notice: `Product created, but the images were not uploaded: ${reason} You can add them below.`
                            }
                        }
                    );

                    return;

                }

            }

            navigate("/admin/products");

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to save product."
            );

        } finally {

            setLoading(false);
            setUploadProgress(null);

        }

    };


    return (

        <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6"
        >

            {error && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}


            <div>

                <label className="mb-2 block text-sm font-semibold">
                    Product Name
                </label>

                <input
                    name="name"
                    value={form.name}
                    onChange={updateField}
                    required
                    maxLength={200}
                    className="w-full rounded-xl border p-3 outline-none focus:border-indigo-500"
                />

            </div>


            <div>

                <label className="mb-2 block text-sm font-semibold">
                    Product Slug
                </label>

                <input
                    name="slug"
                    value={form.slug}
                    onChange={updateField}
                    placeholder="Leave empty to generate from name"
                    maxLength={150}
                    className="w-full rounded-xl border p-3 outline-none focus:border-indigo-500"
                />

            </div>


            <div className="grid gap-5 sm:grid-cols-2">

                <div>

                    <label className="mb-2 block text-sm font-semibold">
                        Category
                    </label>

                    <select
                        name="category_id"
                        value={form.category_id}
                        onChange={updateField}
                        required
                        className="w-full rounded-xl border p-3"
                    >

                        <option value="">Select Category</option>

                        {categories.map(category => (

                            <option
                                key={category.category_id}
                                value={category.category_id}
                            >
                                {category.name}
                            </option>

                        ))}

                    </select>

                </div>


                <div>

                    <label className="mb-2 block text-sm font-semibold">
                        Brand
                    </label>

                    <select
                        name="brand_id"
                        value={form.brand_id}
                        onChange={updateField}
                        className="w-full rounded-xl border p-3"
                    >

                        <option value="">No Brand</option>

                        {brands.map(brand => (

                            <option
                                key={brand.brand_id}
                                value={brand.brand_id}
                            >
                                {brand.name}
                            </option>

                        ))}

                    </select>

                </div>

            </div>


            <div>

                <label className="mb-2 block text-sm font-semibold">
                    Base Price (PKR)
                </label>

                <input
                    type="number"
                    name="base_price"
                    value={form.base_price}
                    onChange={updateField}
                    min="0"
                    step="0.01"
                    required
                    className="w-full rounded-xl border p-3"
                />

            </div>


            <div>

                <label className="mb-2 block text-sm font-semibold">
                    Description
                </label>

                <textarea
                    name="description"
                    value={form.description}
                    onChange={updateField}
                    rows={5}
                    className="w-full rounded-xl border p-3"
                />

            </div>


            <div>

                <label className="mb-2 block text-sm font-semibold">
                    Status
                </label>

                <select
                    name="status"
                    value={form.status}
                    onChange={updateField}
                    className="w-full rounded-xl border p-3"
                >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>

            </div>


            {/* Images */}

            <div id="product-images" className="scroll-mt-24 space-y-4 border-t border-zinc-100 pt-6">

                <div>

                    <h3 className="text-sm font-semibold">
                        Product Images
                    </h3>

                    <p className="mt-1 text-xs text-zinc-500">
                        {product
                            ? "Manage saved images below. Changes to saved images apply immediately."
                            : "The first image becomes the primary image."}
                    </p>

                </div>

                {product && (

                    <ProductImageGallery
                        productId={product.product_id}
                        images={existingImages}
                        onChanged={onRefresh}
                    />

                )}

                {pickerLimit > 0 ? (

                    <div>

                        {product && (
                            <p className="mb-2 text-sm font-medium text-zinc-700">
                                Add new images (uploaded when you save)
                            </p>
                        )}

                        <ProductImagePicker
                            files={newImages}
                            onChange={setNewImages}
                            maxFiles={pickerLimit}
                            markFirstPrimary={!product}
                            disabled={loading}
                        />

                    </div>

                ) : (

                    <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
                        This product already has the maximum of {MAX_IMAGES_PER_PRODUCT} images. Delete one to add another.
                    </p>

                )}

                {loading && uploadProgress !== null && (
                    <div className="space-y-1" role="status" aria-live="polite">
                        <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                            <div className="h-full bg-indigo-600 transition-all" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <p className="text-xs text-zinc-500">Uploading images… {uploadProgress}%</p>
                    </div>
                )}

            </div>


            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
                {loading
                    ? "Saving..."
                    : product
                        ? "Update Product"
                        : "Create Product"}
            </button>

        </form>

    );

}