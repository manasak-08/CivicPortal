/**
 * Online Complaint Registration and Management System
 * Notification Model
 */
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  complaint_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    default: null
  },
  complaint_code: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['assigned', 'status_update', 'remark', 'resolved', 'closed', 'general'],
    default: 'general'
  },
  action_by: {
    name: { type: String, default: 'System' },
    role: { type: String, default: 'admin' },
    department: { type: String, default: '' }
  },
  channels: {
    in_app: {
      sent: { type: Boolean, default: true },
      sent_at: { type: Date, default: Date.now }
    },
    email: {
      sent: { type: Boolean, default: false },
      recipient: { type: String, default: '' },
      sent_at: { type: Date, default: null },
      status: { type: String, default: 'pending' }
    },
    sms: {
      sent: { type: Boolean, default: false },
      recipient_phone: { type: String, default: '' },
      sent_at: { type: Date, default: null },
      status: { type: String, default: 'pending' }
    }
  },
  is_read: {
    type: Boolean,
    default: false,
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Notification', notificationSchema);