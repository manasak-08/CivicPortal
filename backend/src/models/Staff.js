const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Staff name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Staff email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Staff phone is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: [
      'Street Lighting',
      'Water Supply',
      'Drainage & Sewage',
      'Sanitation & Cleaning',
      'General Civic Services'
    ],
    default: 'General Civic Services'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('Staff', staffSchema);