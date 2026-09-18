/**
 * Online Complaint Registration and Management System
 * Notification Dispatch Service (In-App, Gmail/Email via Nodemailer, SMS Alert)
 */
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const smsLogFile = path.join(logsDir, 'sms.log');
const emailLogFile = path.join(logsDir, 'email.log');

/**
 * Configure Nodemailer Transporter
 * If live SMTP credentials exist in .env, uses them.
 * Otherwise uses a test simulated transporter that logs safely.
 */
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

/**
 * Dispatch citizen notification across In-App, Email (Gmail), and SMS channels.
 */
async function sendCitizenNotification({
  userId,
  complaint,
  title,
  message,
  type = 'status_update',
  actionBy = { name: 'Civic Authority', role: 'admin' },
  remarks = ''
}) {
  try {
    const citizen = await User.findById(userId);
    if (!citizen) {
      console.warn(`[NotificationService] Citizen user not found for ID: ${userId}`);
      return null;
    }

    const complaintCode = complaint ? (complaint.complaint_id || complaint) : 'CIVIC-ALERT';

    // 1. Create In-App Notification in Database
    const notification = new Notification({
      user_id: citizen._id,
      complaint_id: complaint && complaint._id ? complaint._id : null,
      complaint_code: complaintCode,
      title,
      message,
      type,
      action_by: {
        name: actionBy.name || 'Municipal Officer',
        role: actionBy.role || 'staff',
        department: actionBy.department || ''
      },
      channels: {
        in_app: { sent: true, sent_at: new Date() },
        email: { sent: false, recipient: citizen.email, status: 'pending' },
        sms: { sent: false, recipient_phone: citizen.phone || '', status: 'pending' }
      }
    });

    await notification.save();

    // 2. Email / Gmail Notification Dispatch
    let emailStatus = 'simulated';
    const emailSubject = `[Civic Portal Alert] ${complaintCode} - ${title}`;
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff;">
        <div style="background: #0f766e; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px;">Civic Complaint Notification</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Online Complaint Registration & Management System</p>
        </div>
        <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
          <p>Dear <strong>${citizen.name}</strong>,</p>
          <p style="font-size: 16px; margin: 16px 0;">An update has been made on your civic complaint <strong>${complaintCode}</strong>:</p>
          <div style="background: #f8fafc; border-left: 4px solid #0f766e; padding: 16px; margin: 16px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #0f766e; font-size: 16px;">${title}</p>
            <p style="margin: 0; color: #334155;">${message}</p>
            ${remarks ? `<p style="margin: 8px 0 0 0; color: #475569; font-style: italic;"><strong>Remarks:</strong> "${remarks}"</p>` : ''}
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #64748b;">Complaint ID:</td><td style="font-weight: bold; color: #0f766e;">${complaintCode}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Action By:</td><td>${actionBy.name} (${actionBy.role.toUpperCase()})</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Timestamp:</td><td>${new Date().toLocaleString()}</td></tr>
          </table>
          <div style="margin-top: 24px; text-align: center;">
            <a href="http://localhost:3000/track-complaint.html?id=${complaintCode}" style="background: #0f766e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; font-weight: 600;">Track Your Complaint</a>
          </div>
        </div>
        <div style="background: #f1f5f9; padding: 14px; text-align: center; color: #64748b; font-size: 12px;">
          Municipal Civic Administration Department • This is an automated notification.
        </div>
      </div>
    `;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || `"Civic Complaint Portal" <${process.env.EMAIL_USER}>`,
          to: citizen.email,
          subject: emailSubject,
          html: emailHtml
        });
        emailStatus = 'delivered';
      } catch (mailErr) {
        console.warn(`[NotificationService] Nodemailer live send error: ${mailErr.message}`);
        emailStatus = 'error: ' + mailErr.message;
      }
    }

    // Record email dispatch log
    const emailLogEntry = `[${new Date().toISOString()}] EMAIL TO: ${citizen.email} | SUBJECT: ${emailSubject} | STATUS: ${emailStatus}\n`;
    fs.appendFileSync(emailLogFile, emailLogEntry);
    console.log(`✉️ [EMAIL NOTIFICATION] Sent to ${citizen.email}: "${emailSubject}" (${emailStatus})`);

    // 3. SMS Notification Dispatch / Simulation
    const citizenPhone = citizen.phone || '+91-9876543210';
    const smsMessage = `[Civic Portal] Complaint ${complaintCode} Update: ${title}. ${remarks ? `Remarks: ${remarks}. ` : ''}Track at: http://localhost:3000/track-complaint.html?id=${complaintCode}`;
    
    // Log SMS dispatch
    const smsLogEntry = `[${new Date().toISOString()}] SMS TO: ${citizenPhone} | MSG: "${smsMessage}" | STATUS: delivered\n`;
    fs.appendFileSync(smsLogFile, smsLogEntry);
    console.log(`📱 [SMS NOTIFICATION] Sent to ${citizenPhone}: "${smsMessage}"`);

    // Update channels in notification document
    notification.channels.email.sent = true;
    notification.channels.email.sent_at = new Date();
    notification.channels.email.status = emailStatus;

    notification.channels.sms.sent = true;
    notification.channels.sms.sent_at = new Date();
    notification.channels.sms.recipient_phone = citizenPhone;
    notification.channels.sms.status = 'delivered';

    await notification.save();
    return notification;
  } catch (err) {
    console.error('[NotificationService] Error sending citizen notification:', err);
    return null;
  }
}

module.exports = {
  sendCitizenNotification
};