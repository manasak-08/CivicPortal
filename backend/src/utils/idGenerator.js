const Complaint = require('../models/Complaint');

const generateComplaintId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `CMP-${currentYear}-`;

  const latest = await Complaint.findOne({
    complaint_id: new RegExp(`^${prefix}`)
  }).sort({ complaint_id: -1 }).select('complaint_id');

  let nextSequence = 1;
  if (latest && latest.complaint_id) {
    const parts = latest.complaint_id.split('-');
    if (parts.length === 3) {
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq)) {
        nextSequence = seq + 1;
      }
    }
  }

  const paddedSequence = String(nextSequence).padStart(4, '0');
  return `${prefix}${paddedSequence}`;
};

module.exports = { generateComplaintId };