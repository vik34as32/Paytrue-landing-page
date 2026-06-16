import { transporter } from "./transporter";

interface MailProps {
  subject: string;
  html: string;
}

export async function sendMail({
  subject,
  html,
}: MailProps) {
  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO,
    subject,
    html,
  });
}