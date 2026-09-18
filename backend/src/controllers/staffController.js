const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Staff = require('../models/Staff');
const Complaint = require('../models/Complaint');
const ComplaintUpdate = require('../models/ComplaintUpdate');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { sendCitizenNotification } = require('../utils/notificationService');

// POST /api/staff/login - Dedicated Staff Login
exports.staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    // Role verification: Staff only
    if (user.role !== 'staff') {
      return sendError(res, 403, 'Access denied. Only registered field staff members can log in through the Staff Portal.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'complaint_system_jwt_super_secret_key_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const staffProfile = await Staff.findOne({ user_id: user._id });

    return sendSuccess(res, 200, 'Staff login successful!', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: staffProfile ? staffProfile.department : 'Field Maintenance'
      }
    });
  } catch (error) {
    console.error('Staff login error:', error);
    return sendError(res, 500, 'Server error during staff login.', error.message);
  }
};

// GET /api/staff/complaints - View complaints assigned to logged in staff
exports.getAssignedComplaints = async (req, res) => {
  try {
    const { status, search } = req.query;

    const query = { assigned_staff_id: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { complaint_id: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const complaints = await Complaint.find(query)
      .populate('user_id', 'name email phone address')
      .sort({ updated_at: -1 });
      
    const counts = {
      total: await Complaint.countDocuments({ assigned_staff_id: req.user._id }),
      assigned: await Complaint.countDocuments({ assigned_staff_id: req.user._id, status: 'Assigned' }),
      in_progress: await Complaint.countDocuments({ assigned_staff_id: req.user._id, status: 'In Progress' }),
      resolved: await Complaint.countDocuments({ assigned_staff_id: req.user._id, status: 'Resolved' })
    };

    return sendSuccess(res, 200, 'Assigned complaints retrieved', { complaints, counts });
  } catch (error) {
    console.error('Staff getAssignedComplaints error:', error);
    return sendError(res, 500, 'Error retrieving assigned complaints.', error.message);
  }
};
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found.');
    }

    // Ensure this complaint is assigned to the requesting staff member
    if (complaint.assigned_staff_id && complaint.assigned_staff_id.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You are only authorized to update complaints assigned to you.');
    }

    complaint.status = status;
    complaint.updated_at = Date.now();
    await complaint.save();

  
    const update = await ComplaintUpdate.create({
      complaint_id: complaint._id,
      staff_id: req.user._id,
      status,
      remarks: remarks || `Status updated to ${status} by ${req.user.name}.`
    });

    const staffProfile = await Staff.findOne({ user_id: req.user._id });
    const dept = staffProfile ? staffProfile.department : 'Field Maintenance';

    // Notify citizen via In-App, Email, and SMS
    await sendCitizenNotification({
      userId: complaint.user_id,
      complaint: complaint,
      title: status === 'Resolved' ? '🎉 Complaint Resolved!' : `Field Update: ${status}`,
      message: `Field staff ${req.user.name} (${dept}) updated your complaint ${complaint.complaint_id} to "${status}". ${remarks ? `Remarks: ${remarks}` : ''}`,
      type: status === 'Resolved' ? 'resolved' : 'status_update',
      actionBy: { name: req.user.name, role: 'staff', department: dept },
      remarks: remarks || `Status set to ${status}`
    });

    return sendSuccess(res, 200, `Complaint status updated to ${status}.`, {
      complaint,
      update
    });
  } catch (error) {
    console.error('Staff updateStatus error:', error);
    return sendError(res, 500, 'Error updating complaint status.', error.message);
  }
};