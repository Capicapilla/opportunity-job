import nodemailer from "nodemailer";
import { config } from "./config.js";

const transporter = nodemailer.createTransport({
  host: config.emailHost,
  port: config.emailPort,
  secure: config.emailPort == 465,
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: config.emailFrom,
      to,
      subject,
      html,
    });

    console.log("Email enviado:", info.messageId);
    return info;
  } catch (err) {
    console.error("Error, No se ha enviando email:", err);
    throw err;
  }
};
