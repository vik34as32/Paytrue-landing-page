import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // 587 ke liye false
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendMailProps {
  to?: string;
  subject: string;
  html: string;
}

export async function sendMail({
  to,
  subject,
  html,
}: SendMailProps) {
  return await transporter.sendMail({
    from: `"PayTrue Support" <${process.env.MAIL_FROM}>`,
    to: to || process.env.MAIL_TO,
    subject,
    html,
  });
}