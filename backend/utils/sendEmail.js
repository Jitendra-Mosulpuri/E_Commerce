import nodemailer from "nodemailer";

const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // Gmail App Password
      },
    });

    const mailOptions = {
      from: `"ShopNest Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject,
      html: message,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}: ${error.message}`);
  }
};

export default sendEmail;
