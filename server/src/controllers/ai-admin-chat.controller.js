
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
    processAdminMessage,
} from "../services/ai-admin-chat.service.js";

export const chatWithAdminAssistant = asyncHandler(
    async (req, res) => {

        const {
            message,
            history = [],
        } = req.body;

        const data = await processAdminMessage({

            message: message.trim(),

            history,

        });

        return res.status(200).json(

            new ApiResponse(
                200,
                "Admin AI response generated successfully.",
                data
            )

        );

    }
);
