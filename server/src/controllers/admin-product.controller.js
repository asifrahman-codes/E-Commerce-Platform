import * as service from "../services/admin-product.service.js";

export const getProducts = async (req, res, next) => {
    try {
        const data = await service.getAdminProductsService(req.query);

        return res.status(200).json({
            success: true,
            message: "Products retrieved successfully.",
            data
        });
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (req, res, next) => {
    try {
        const data = await service.getAdminProductDetailsService(
            req.params.productId
        );

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (req, res, next) => {
    try {
        const data = await service.createAdminProductService(req.body);

        return res.status(201).json({
            success: true,
            message: "Product created successfully.",
            data
        });
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const data = await service.updateAdminProductService(
            req.params.productId,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Product updated successfully.",
            data
        });
    } catch (error) {
        next(error);
    }
};

export const updateProductStatus = async (req, res, next) => {
    try {
        const data = await service.updateAdminProductStatusService(
            req.params.productId,
            req.body.status
        );

        return res.status(200).json({
            success: true,
            message: "Product status updated.",
            data
        });
    } catch (error) {
        next(error);
    }
};