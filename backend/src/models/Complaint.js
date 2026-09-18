const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaint_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Complaint category is required'],
    enum: [
      'Street Light',
      'Water Pipe Leakage',
      'Rain Water Drainage',
      'Roadside Cleaning'
    ]
  },
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true,
    maxlength: [120, 'Title cannot exceed 120 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  landmark: {
    type: String,
    trim: true,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: [
      'Submitted',
      'Pending',
      'Assigned',
      'In Progress',
      'Resolved',
      'Closed',
      'Rejected'
    ],
    default: 'Submitted',
    index: true
  },
  assigned_staff_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Complaint', complaintSchema);