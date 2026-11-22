
import ApiError from "../utils/ApiError.js";

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_MESSAGES = 6;
const MAX_PRODUCT_IDS = 4;

export function validateAssistantRequest(req, res, next) {
  const { message, history, productIds } = req.body ?? {};

  if (
    typeof message !== "string" ||
    !message.trim()
  ) {
    return next(
      new ApiError(400, "A valid message is required.")
    );
  }

  if (message.trim().length > MAX_MESSAGE_LENGTH) {
    return next(
      new ApiError(
        400,
        `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`
      )
    );
  }

  if (history !== undefined && !Array.isArray(history)) {
    return next(new ApiError(400, "History must be an array."));
  }

  if (history && history.length > MAX_HISTORY_MESSAGES) {
    return next(
      new ApiError(
        400,
        `Only the last ${MAX_HISTORY_MESSAGES} messages are allowed.`
      )
    );
  }

  if (history) {
    for (const item of history) {
      if (
        !item ||
        !["user", "assistant"].includes(item.role) ||
        typeof item.content !== "string" ||
        item.content.length > 500
      ) {
        return next(
          new ApiError(400, "Invalid conversation history.")
        );
      }
    }
  }

  if (productIds !== undefined) {
    if (
      !Array.isArray(productIds) ||
      productIds.length < 2 ||
      productIds.length > MAX_PRODUCT_IDS
    ) {
      return next(
        new ApiError(
          400,
          `Provide between 2 and ${MAX_PRODUCT_IDS} product IDs for comparison.`
        )
      );
    }

    const validIds = productIds.every(
      (id) =>
        Number.isSafeInteger(Number(id)) &&
        Number(id) > 0 &&
        Number(id) <= 2147483647
    );

    if (
      !validIds ||
      new Set(productIds.map(Number)).size !== productIds.length
    ) {
      return next(
        new ApiError(400, "Invalid or duplicate product IDs.")
      );
    }
  }

  return next();
}
