const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    // 1. Create Transporter (Using Gmail as an example)
    // One must use an "App Password" if using Gmail (Not your normal login password)
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.EMAIL_USER
        pass: process.env.EMAIL_PASS  
      }
    });

    // 2. Mail Options
    const mailOptions = {
      from: `"AnonSafety Security" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text
    };

    // 3. Send
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${to}`);
  } catch (error) {
    console.error("❌ Email send failed:", error);
    //throw error here to prevent crashing the report flow if email fails
  }
};

module.exports = sendEmail;