import nodemailer from "nodemailer";
import { notificationConfig } from "../config/notification.config.js";

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

export const smtpEmailProvider = {
  send(message) {
    return getTransporter().sendMail(message);
  },
};
