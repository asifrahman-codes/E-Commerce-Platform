
import ApiError from "../utils/ApiError.js";

export function validateAdminChat(req, res, next) {

    const {
        message,
        history = [],
    } = req.body ?? {};

    if (
        typeof message !== "string" ||
        !message.trim()
    ) {
        return next(
            new ApiError(400, "A valid message is required.")
        );
    }

    if (message.trim().length > 1000) {

        return next(
            new ApiError(
                400,
                "Message cannot exceed 1000 characters."
            )
        );

    }

    if (!Array.isArray(history) || history.length > 6) {

        return next(
            new ApiError(
                400,
                "Conversation history is invalid."
            )
        );

    }

    for (const item of history) {

        if (
            !item ||
            !["user", "assistant"].includes(item.role) ||
            typeof item.content !== "string" ||
            item.content.length > 500
        ) {

            return next(
                new ApiError(
                    400,
                    "Invalid conversation history."
                )
            );

        }

    }

    next();

}
