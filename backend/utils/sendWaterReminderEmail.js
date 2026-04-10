const nodemailer = require("nodemailer");

const sendWaterReminderEmail = async ({ name, email, plantNickname, plantName }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Plant Cupid" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Water reminder for ${plantNickname} 🌱`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #0A3323;">
        <h2>Hello ${name} 🌿</h2>
        <p>This is a gentle reminder from Plant Cupid.</p>
        <p>Your plant <strong>${plantNickname}</strong> (${plantName}) needs watering today.</p>
        <p>Please give it some care so it stays healthy and happy.</p>
        <p style="margin-top: 20px;">With love,<br/><strong>Plant Cupid</strong></p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Reminder mail sent to ${email}:`, info.response);
};

module.exports = sendWaterReminderEmail;