/**
 * Online Complaint Registration and Management System
 * Notification Controller
 */
const fs = require('fs');
const path = require('path');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// GET /api/notifications - Get all notifications for logged-in user
exports.getNotifications = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const unreadOnly = req.query.unreadOnly === 'true';

    const query = { user_id: req.user._id };
    if (unreadOnly) {
      query.is_read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ created_at: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      user_id: req.user._id,
      is_read: false
    });

    return sendSuccess(res, 200, 'Notifications retrieved successfully', {
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return sendError(res, 500, 'Error fetching notifications', error.message);
  }
};

// PUT /api/notifications/:id/read - Mark single notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      user_id: req.user._id
    });

    if (!notification) {
      return sendError(res, 404, 'Notification not found.');
    }

    notification.is_read = true;
    await notification.save();

    const unreadCount = await Notification.countDocuments({
      user_id: req.user._id,
      is_read: false
    });

    return sendSuccess(res, 200, 'Notification marked as read', {
      notification,
      unreadCount
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return sendError(res, 500, 'Error marking notification as read', error.message);
  }
};

// PUT /api/notifications/read-all - Mark all user notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user._id, is_read: false },
      { $set: { is_read: true } }
    );

    return sendSuccess(res, 200, 'All notifications marked as read', {
      unreadCount: 0
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return sendError(res, 500, 'Error marking all notifications as read', error.message);
  }
};

// DELETE /api/notifications/:id - Delete single notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user_id: req.user._id
    });

    if (!notification) {
      return sendError(res, 404, 'Notification not found.');
    }

    return sendSuccess(res, 200, 'Notification removed successfully');
  } catch (error) {
    console.error('Error deleting notification:', error);
    return sendError(res, 500, 'Error deleting notification', error.message);
  }
};

// GET /api/notifications/logs - View dispatch logs (Email & SMS)
exports.getNotificationLogs = async (req, res) => {
  try {
    const logsDir = path.join(__dirname, '../../logs');
    const emailLogPath = path.join(logsDir, 'email.log');
    const smsLogPath = path.join(logsDir, 'sms.log');

    const emailLogs = fs.existsSync(emailLogPath) ? fs.readFileSync(emailLogPath, 'utf8').split('\n').filter(Boolean).slice(-20) : [];
    const smsLogs = fs.existsSync(smsLogPath) ? fs.readFileSync(smsLogPath, 'utf8').split('\n').filter(Boolean).slice(-20) : [];

    return sendSuccess(res, 200, 'Notification delivery logs retrieved', {
      emailLogs,
      smsLogs
    });
  } catch (error) {
    return sendError(res, 500, 'Error retrieving logs', error.message);
  }
};