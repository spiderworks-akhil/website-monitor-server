import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendFailureEmail = async (to, siteName, siteUrl) => {
  const mailOptions = {
    from: `"Website Monitor" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🚨 Website Down Alert: ${siteName}`,
    text: `${siteName} is down. Check it here: ${siteUrl}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #d9534f;">🚨 Website Down Alert</h2>
        <p><strong>${siteName}</strong> is currently not reachable:</p>
        <p><a href="${siteUrl}" target="_blank" rel="noopener noreferrer">${siteUrl}</a></p>
        <p>Checked at: ${new Date().toLocaleString()}</p>
        <hr />
        <p style="font-size: 12px; color: #888;">This is an automated alert from Website Monitor. Please do not reply.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
  } catch (err) {
    console.error("Email send failed:", err);
  }
};
