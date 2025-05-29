import nodemailer from "nodemailer";

// Gmail SMTP transporter (App Password required, not real password)
export const transporter = nodemailer.createTransport({
  service: "gmail", // Use the Gmail service instead of raw smtp config
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password generated from your Google account
  },
});

// Failure alert email
export const sendFailureEmail = async (to, siteName, siteUrl) => {
  const fromName = "Website Monitor";
  const fromEmail = process.env.EMAIL_USER;

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`, // Well-formatted sender
    to,
    subject: `🚨 Website Down Alert: ${siteName}`,
    text: `${siteName} is currently down. Please check it: ${siteUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #d9534f;">🚨 Website Down Alert</h2>
        <p><strong>${siteName}</strong> is currently not reachable:</p>
        <p><a href="${siteUrl}" style="color: #0275d8;">${siteUrl}</a></p>
        <p><strong>Checked at:</strong> ${new Date().toLocaleString()}</p>
        <hr />
        <p style="font-size: 12px; color: #888;">This is an automated alert from Website Monitor.</p>
      </div>
    `,
    headers: {
      "X-Priority": "1 (Highest)",
      "X-MSMail-Priority": "High",
      Importance: "High",
    },
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Alert email sent to:", to);
  } catch (err) {
    console.error("Email send error:", err);
  }
};
