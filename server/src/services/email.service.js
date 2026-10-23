
import nodemailer from "nodemailer";
import { notificationConfig } from "../config/notification.config.js";
import { buildNotificationEmail } from "../utils/email/notification-email.template.js";

let transporter;

function getTransporter() {
  const smtp = notificationConfig.smtp;

  if (!smtp.host || !smtp.user || !smtp.pass) {
    throw new Error("SMTP configuration is incomplete.");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });
  }

  return transporter;
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

  const email = buildNotificationEmail({ title, message });

  return getTransporter().sendMail({
    from: notificationConfig.emailFrom,
    to,
    subject: title,
    text: email.text,
    html: email.html,
  });
}
