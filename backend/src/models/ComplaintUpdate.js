const mongoose = require('mongoose');

const complaintUpdateSchema = new mongoose.Schema({
  complaint_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true,
    index: true
  },
  staff_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: [
      'Submitted',
      'Pending',
      'Assigned',
      'In Progress',
      'Resolved',
      'Closed',
      'Rejected'
    ]
  },
  remarks: {
    type: String,
    required: [true, 'Remarks are required'],
    trim: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: false, updatedAt: 'updated_at' }
});

module.exports = mongoose.model('ComplaintUpdate', complaintUpdateSchema);