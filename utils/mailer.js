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
    from: process.env.EMAIL_USER,
    to,
    subject: `🚨 Website Down Alert: ${siteName}`,
    text: `${siteName} is down. Check: ${siteUrl}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h2 style="color: #d9534f;">🚨 Website Down Alert</h2>
        <p><strong>${siteName}</strong> is not reachable at:</p>
        <p><a href="${siteUrl}">${siteUrl}</a></p>
        <p>Checked at: ${new Date().toLocaleString()}</p>
        <hr />
        <p style="font-size: 12px; color: #888;">This is an automated alert from Website Monitor.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
