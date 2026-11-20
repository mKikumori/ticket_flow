import nodemailer from "nodemailer";

export async function sendEmail(email, subject, message) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.EMAIL_PSW,
    },
  });

  await transporter.sendMail({
    from: process.env.MY_EMAIL,
    to: email,
    subject,
    text: message,
  });
}
