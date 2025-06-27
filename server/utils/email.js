const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `Expenza <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Email could not be sent');
  }
};

const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to Expenza!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3B82F6;">Welcome to Expenza, ${name}!</h1>
        <p>Thank you for joining Expenza, your personal finance management companion.</p>
        <p>Get started by:</p>
        <ul>
          <li>Adding your first expense</li>
          <li>Setting up your budget</li>
          <li>Joining or creating a committee</li>
        </ul>
        <p>Happy saving!</p>
        <p>The Expenza Team</p>
      </div>
    `
  }),
  
  passwordReset: (name, resetToken) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3B82F6;">Password Reset Request</h1>
        <p>Hi ${name},</p>
        <p>You requested a password reset for your Expenza account.</p>
        <p>Your reset token is: <strong>${resetToken}</strong></p>
        <p>This token will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>The Expenza Team</p>
      </div>
    `
  }),
  
  committeeInvite: (name, committeeName, inviteCode) => ({
    subject: `You're invited to join ${committeeName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3B82F6;">Committee Invitation</h1>
        <p>Hi ${name},</p>
        <p>You've been invited to join the committee: <strong>${committeeName}</strong></p>
        <p>Use invite code: <strong>${inviteCode}</strong></p>
        <p>Login to your Expenza account to join!</p>
        <p>The Expenza Team</p>
      </div>
    `
  }),
  
  paymentReminder: (name, committeeName, amount) => ({
    subject: 'Payment Reminder',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #F59E0B;">Payment Reminder</h1>
        <p>Hi ${name},</p>
        <p>This is a reminder that your payment of $${amount} for committee "${committeeName}" is due.</p>
        <p>Please make your payment via JazzCash to avoid any delays.</p>
        <p>The Expenza Team</p>
      </div>
    `
  })
};

module.exports = {
  sendEmail,
  emailTemplates
};