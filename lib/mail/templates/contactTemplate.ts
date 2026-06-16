interface ContactTemplateProps {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const contactTemplate = ({
  name,
  email,
  phone,
  message,
}: ContactTemplateProps) => {
  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background:#f5f7fa; padding:20px;">
        <div style="max-width:600px;margin:auto;background:#fff;padding:30px;border-radius:12px;">
          
          <h2 style="color:#0A84FF;">
            New Contact Form Submission
          </h2>

          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td><strong>Name</strong></td>
              <td>${name}</td>
            </tr>

            <tr>
              <td><strong>Email</strong></td>
              <td>${email}</td>
            </tr>

            <tr>
              <td><strong>Phone</strong></td>
              <td>${phone}</td>
            </tr>

            <tr>
              <td><strong>Message</strong></td>
              <td>${message}</td>
            </tr>
          </table>

          <hr />

          <p>
            PayTrue Contact Form Notification
          </p>

        </div>
      </body>
    </html>
  `;
};