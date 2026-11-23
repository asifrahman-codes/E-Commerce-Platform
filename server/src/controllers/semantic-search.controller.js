import asyncHandler from "../utils/asyncHandler.js";

import * as semanticSearchService from "../services/semantic-search.service.js";

// Public semantic product search

export const semanticSearch = asyncHandler(
    async (req, res) => {

        const data =
            await semanticSearchService.searchProductsSemantically(
                req.query.q,
                {
                    min_price: req.query.min_price,
                    max_price: req.query.max_price,
                    in_stock: req.query.in_stock,
                    limit: req.query.limit,
                    page: req.query.page,
                    category_id: req.query.category_id,
                    brand_id: req.query.brand_id,
                }
            );

        return res.status(200).json({
            success: true,
            message: "Semantic product search completed successfully.",
            data,
        });
    }
);

// Admin: index product catalog

export const indexProducts = asyncHandler(
    async (req, res) => {

        const data =
            await semanticSearchService.indexProductCatalog();

        return res.status(200).json({
            success: true,
            message: "Product semantic indexing completed successfully.",
            data,
        });
    }
);

// Admin: indexing statistics

export const getIndexStatistics = asyncHandler(
    async (req, res) => {

        const data =
            await semanticSearchService.getSemanticIndexStatistics();

        return res.status(200).json({
            success: true,
            message: "Semantic index statistics retrieved successfully.",
            data,
        });
    }
);