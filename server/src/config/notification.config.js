
function readBoolean(value, defaultValue = false) {
  if (value === undefined || value === "") {
    return defaultValue;
  }

  return ["true", "1", "yes"].includes(
    String(value).toLowerCase()
  );
}

export const notificationConfig = {
  enabled: readBoolean(
    process.env.NOTIFICATIONS_ENABLED,
    true
  ),

  emailEnabled: readBoolean(
    process.env.NOTIFICATION_EMAIL_ENABLED,
    false
  ),

  emailFrom:
    process.env.NOTIFICATION_EMAIL_FROM ||
    "no-reply@example.com",

  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    secure: readBoolean(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
};
