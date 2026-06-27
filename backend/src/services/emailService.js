const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Setup mock or real SMTP transport
const createTransport = () => {
  const isEnabled = process.env.ENABLE_EMAILS === 'true';
  
  if (!isEnabled) {
    // Return a mock transport that logs to console
    return {
      sendMail: async (mailOptions) => {
        logger.info(`✉️ [MOCK EMAIL SENT] to: ${mailOptions.to} | Subject: ${mailOptions.subject}`);
        return { messageId: `mock-msg-${Date.now()}` };
      }
    };
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525'),
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  });
};

const transport = createTransport();
const emailFrom = process.env.EMAIL_FROM || 'noreply@jigo.app';

const sendMail = async ({ to, subject, html, text }) => {
  try {
    const info = await transport.sendMail({
      from: emailFrom,
      to,
      subject,
      html,
      text
    });
    return info;
  } catch (err) {
    logger.error(`❌ Failed to send email to ${to}:`, err);
    // Don't crash request, let it resolve
  }
};

const sendBookingNotification = async (recipientEmail, recipientName, booking, role) => {
  const formattedDate = new Date(booking.date).toLocaleDateString();
  
  const clientSubject = `Booking Request Sent!`;
  const companionSubject = `New Booking Request Received!`;

  // Calculate duration in hours from startTime and endTime
  const calcDuration = () => {
    if (!booking.startTime || !booking.endTime) return 'N/A';
    const [sh, sm] = booking.startTime.split(':').map(Number);
    const [eh, em] = booking.endTime.split(':').map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    const hrs = mins / 60;
    return hrs > 0 ? `${hrs} ${hrs === 1 ? 'Hour' : 'Hours'}` : 'N/A';
  };

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #6366f1;">Jigo App Booking Alert</h2>
      <p>Hello ${recipientName},</p>
      <p>${role === 'customer' 
        ? 'Your booking request has been successfully submitted and is pending confirmation.' 
        : 'You have received a new booking request! Log in to your dashboard to accept or reject it.'}
      </p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Booking ID:</strong> ${booking.id}</p>
        <p><strong>Scheduled Date:</strong> ${formattedDate} at ${booking.startTime}</p>
        <p><strong>Duration:</strong> ${calcDuration()}</p>
        <p><strong>Total Amount:</strong> ₹${booking.totalPrice}</p>
      </div>
      <p>Best regards,<br/>The Jigo Team</p>
    </div>
  `;

  return sendMail({
    to: recipientEmail,
    subject: role === 'customer' ? clientSubject : companionSubject,
    html
  });
};

module.exports = {
  sendMail,
  sendBookingNotification
};
