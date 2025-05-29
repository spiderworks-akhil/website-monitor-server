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
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h2>Website Down Alert</h2>
        <p>The website <strong>${siteName}</strong> is currently not reachable:</p>
        <p><a href="${siteUrl}">${siteUrl}</a></p>
        <p>Please check it as soon as possible.</p>
        <hr />
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
