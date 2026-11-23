
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    generateAIContent,
} from "../services/ai-content-generator.service.js";

export const generateContent = asyncHandler(
    async (req, res) => {

        const {
            type,
            product_name,
            details,
        } = req.body;

        const data = await generateAIContent({

            type,

            product_name,

            details,

        });

        return res.status(200).json(

            new ApiResponse(
                200,
                "AI content generated successfully.",
                data
            )

        );

    }
);
