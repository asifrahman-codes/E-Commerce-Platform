
function isPositiveInteger(value) {
  return /^[1-9]\d*$/.test(String(value ?? ""));
}

function badRequest(res, message) {
  return res.status(400).json({
    success: false,
    message,
  });
}

export function validateNotificationId(req, res, next) {
  if (!isPositiveInteger(req.params.notificationId)) {
    return badRequest(res, "Invalid notification ID.");
  }

  next();
}

export function validateNotificationQuery(req, res, next) {
  const allowed = new Set([
    "page",
    "limit",
    "unread_only",
  ]);

  for (const [key, value] of Object.entries(req.query)) {
    if (!allowed.has(key)) {
      return badRequest(
        res,
        `Unknown query parameter: ${key}.`
      );
    }

    if (typeof value !== "string") {
      return badRequest(
        res,
        `${key} must be supplied once as a single value.`
      );
    }
  }

  next();
}
