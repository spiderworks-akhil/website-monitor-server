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
    subject: `Website Down Alert: ${siteName}`,
    html: `
      <h3>🚨 Website Down Alert</h3>
      <p>The website <strong>${siteName}</strong> (<a href="${siteUrl}">${siteUrl}</a>) is currently <span style="color:red">not reachable</span>.</p>
      <p>Please check it immediately.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
