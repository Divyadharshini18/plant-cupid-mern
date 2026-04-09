const nodemailer = require("nodemailer");

const sendWelcomeEmail = async (name, email) => {
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.verify();
  console.log("Mailer is ready");

  const mailOptions = {
    from: `"Plant Cupid" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to Plant Cupid 🌱",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #0A3323;">
        <h2>Welcome to Plant Cupid, ${name}! 🌿</h2>
        <p>We’re so happy to have you here.</p>
        <p>Your plant care journey starts now — track your plants, manage watering schedules, and help your green friends thrive.</p>
        <p style="margin-top: 20px;">With love,<br/><strong>Plant Cupid</strong></p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Mail sent:", info.response);
};

module.exports = sendWelcomeEmail;