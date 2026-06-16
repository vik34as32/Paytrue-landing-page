interface WelcomeTemplateProps {
  name: string;
}

export const welcomeTemplate = ({
  name,
}: WelcomeTemplateProps) => {
  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family:Arial,sans-serif;background:#f5f7fa;padding:20px;">
        
        <div style="max-width:650px;margin:auto;background:#fff;padding:30px;border-radius:12px;">
          
          <h1 style="color:#0A84FF;">
            Welcome to PayTrue
          </h1>

          <p>
            Hello ${name},
          </p>

          <p>
            Thank you for joining PayTrue.
            We are delighted to have you with us.
          </p>

          <p>
            If you have any questions, please contact our support team.
          </p>

        </div>

      </body>
    </html>
  `;
};