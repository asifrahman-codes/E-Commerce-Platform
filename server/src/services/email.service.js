
import { notificationConfig } from "../config/notification.config.js";
import { buildNotificationEmail } from "../utils/email/notification-email.template.js";
import { smtpEmailProvider } from "../providers/smtp-email.provider.js";

const providers = new Map([
  ["smtp", smtpEmailProvider],
]);

export function registerEmailProvider(name, provider) {
  if (!/^[a-z][a-z0-9_-]*$/i.test(String(name))) {
    throw new Error("Email provider name is invalid.");
  }

  if (!provider || typeof provider.send !== "function") {
    throw new Error("Email providers must implement send(message).");
  }

  providers.set(String(name).toLowerCase(), provider);
}

export async function sendNotificationEmail({
  to,
  title,
  message,
}) {
  if (!notificationConfig.emailEnabled) {
    return { skipped: true, reason: "Email is disabled." };
  }

  if (!to || typeof to !== "string") {
    return { skipped: true, reason: "Recipient email is missing." };
  }

  const providerName = notificationConfig.emailProvider;
  const provider = providers.get(providerName);

  if (!provider) {
    throw new Error(`Email provider "${providerName}" is not registered.`);
  }

  const email = buildNotificationEmail({ title, message });

  return provider.send({
    from: notificationConfig.emailFrom,
    to,
    subject: title,
    text: email.text,
    html: email.html,
  });
}
