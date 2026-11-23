
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    getInventoryIntelligence,
} from "../services/ai-inventory.service.js";

export const getInventoryInsights = asyncHandler(
    async (req, res) => {

        const data = await getInventoryIntelligence();

        return res.status(200).json(

            new ApiResponse(
                200,
                "AI inventory intelligence generated successfully.",
                data
            )

        );

    }
);
