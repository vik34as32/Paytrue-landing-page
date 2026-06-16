interface SupportTemplateProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const supportTemplate = ({
  name,
  email,
  subject,
  message,
}: SupportTemplateProps) => {
  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family:Arial,sans-serif;padding:20px;">
        
        <div style="max-width:650px;margin:auto;background:#fff;padding:30px;border-radius:12px;">
          
          <h2>Support Ticket</h2>

          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>

          <div style="background:#f8fafc;padding:15px;border-radius:8px;">
            ${message}
          </div>

        </div>

      </body>
    </html>
  `;
};