import asyncHandler from "../utils/asyncHandler.js";

import {
    getProductReviewSummary as getProductReviewSummaryService,
} from "../services/ai-review-summary.service.js";

export const getProductReviewSummary = asyncHandler(
    async (req, res) => {

        const data = await getProductReviewSummaryService(
            req.params.productId
        );

        return res.status(200).json({
            success: true,
            message: "AI product review summary retrieved successfully.",
            data,
        });
    }
);