// Email utility: sends a winner notification or logs a mock message in development.
const nodemailer = require("nodemailer");

async function sendWinEmail(toEmail, userName, itemName, amountToPay, dateWon) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`\n========================================`);
        console.log(`[MAIL MOCK] Email system not configured in .env`);
        console.log(`[MAIL MOCK] To: ${toEmail}`);
        console.log(`[MAIL MOCK] Subject: You won the auction: ${itemName}`);
        console.log(`[MAIL MOCK] Body:`);
        console.log(`Congratulations ${userName}! You have won the bidding for "${itemName}".`);
        console.log(`Date Won: ${new Date(dateWon).toLocaleString()}`);
        console.log(`Amount to Pay: $${amountToPay}`);
        console.log(`Please log in to your dashboard to complete the payment.`);
        console.log(`========================================\n`);
        return;
    }

    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlContent = `
      <h2>Congratulations, ${userName}!</h2>
      <p>You have won the bidding for <strong>${itemName}</strong>.</p>
      <ul>
        <li><strong>Date Won:</strong> ${new Date(dateWon).toLocaleString()}</li>
        <li><strong>Amount to Pay:</strong> $${amountToPay}</li>
      </ul>
      <p>Please log in to your dashboard to complete the payment.</p>
      <br />
      <p>Thank you,<br/>Auction Team</p>
    `;

    let info = await transporter.sendMail({
      from: '"Auction Platform" <no-reply@auctionplatform.com>',
      to: toEmail,
      subject: `You won the auction: ${itemName}`,
      html: htmlContent,
    });

    console.log("Message sent to %s: %s", toEmail, info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = { sendWinEmail };
