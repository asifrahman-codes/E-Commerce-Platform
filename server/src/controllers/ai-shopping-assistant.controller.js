
import asyncHandler from "../utils/asyncHandler.js";

import {
  processShoppingMessage,
} from "../services/ai-shopping-assistant.service.js";

export const chatWithShoppingAssistant = asyncHandler(
  async (req, res) => {
    const { message, history = [], productIds = [] } = req.body;

    const data = await processShoppingMessage({
      message: message.trim(),
      history,
      productIds: productIds.map(Number),
    });

    return res.status(200).json({
      success: true,
      message: "AI assistant response generated successfully.",
      data,
    });
  }
);
