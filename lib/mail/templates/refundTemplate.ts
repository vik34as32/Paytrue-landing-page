interface RefundTemplateProps {
  transactionId: string;
  amount: string;
  reason: string;
  name: string;
  email: string;
}

export const refundTemplate = ({
  transactionId,
  amount,
  reason,
  name,
  email,
}: RefundTemplateProps) => {
  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family:Arial,sans-serif;background:#f5f7fa;padding:20px;">
        
        <div style="max-width:650px;margin:auto;background:white;padding:30px;border-radius:12px;">
          
          <h2 style="color:#0A84FF;">
            Refund Request Submitted
          </h2>

          <p>
            A new refund request has been received.
          </p>

          <table style="width:100%;">
            <tr>
              <td><strong>Name</strong></td>
              <td>${name}</td>
            </tr>

            <tr>
              <td><strong>Email</strong></td>
              <td>${email}</td>
            </tr>

            <tr>
              <td><strong>Transaction ID</strong></td>
              <td>${transactionId}</td>
            </tr>

            <tr>
              <td><strong>Amount</strong></td>
              <td>₹ ${amount}</td>
            </tr>

            <tr>
              <td><strong>Reason</strong></td>
              <td>${reason}</td>
            </tr>
          </table>

        </div>

      </body>
    </html>
  `;
};