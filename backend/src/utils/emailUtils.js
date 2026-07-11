const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!env.smtp.host || !env.smtp.user) {
    console.warn('SMTP not configured — emails will be logged to console');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: false,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  const transport = getTransporter();
  if (!transport) {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    console.log(html);
    return;
  }
  await transport.sendMail({ from: env.smtp.from, to, subject, html });
};

const sendVerificationEmail = async (email, token) => {
  const url = `${env.clientUrl}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify your email — Cloud Storage',
    html: `<h2>Welcome to Cloud Storage!</h2><p><a href="${url}">${url}</a></p>`,
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const url = `${env.clientUrl}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset your password — Cloud Storage',
    html: `<h2>Password Reset</h2><p><a href="${url}">${url}</a></p>`,
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
