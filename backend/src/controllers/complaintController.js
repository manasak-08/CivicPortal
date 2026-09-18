const Complaint = require('../models/Complaint');
const ComplaintUpdate = require('../models/ComplaintUpdate');
const User = require('../models/User');
const { generateComplaintId } = require('../utils/idGenerator');
const { sendSuccess, sendError } = require('../utils/responseHandler');

exports.createComplaint = async (req, res) => {
  try {
    const { category, title, description, location, landmark } = req.body;
    const complaint_id = await generateComplaintId();

    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const complaint = await Complaint.create({
      complaint_id,
      user_id: req.user._id,
      category,
      title,
      description,
      location,
      landmark: landmark || '',
      image: imagePath,
      status: 'Submitted'
    });
    await ComplaintUpdate.create({
      complaint_id: complaint._id,
      staff_id: req.user._id,
      status: 'Submitted',
      remarks: 'Complaint registered successfully by citizen.'
    });

    return sendSuccess(res, 201, 'Complaint registered successfully!', {
      complaint_id: complaint.complaint_id,
      id: complaint._id,
      category: complaint.category,
      title: complaint.title,
      status: complaint.status,
      created_at: complaint.created_at
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return sendError(res, 500, 'Failed to register complaint. Please try again.', error.message);
  }
};
exports.getCitizenComplaints = async (req, res) => {
  try {
    const { search, category, status } = req.query;

    const query = { user_id: req.user._id };

    if (category && category !== 'all') {
      query.category = category;
    }

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
      .populate('assigned_staff_id', 'name email phone')
      .sort({ created_at: -1 });

    const counts = {
      total: await Complaint.countDocuments({ user_id: req.user._id }),
      pending: await Complaint.countDocuments({ user_id: req.user._id, status: { $in: ['Submitted', 'Pending'] } }),
      in_progress: await Complaint.countDocuments({ user_id: req.user._id, status: { $in: ['Assigned', 'In Progress'] } }),
      resolved: await Complaint.countDocuments({ user_id: req.user._id, status: 'Resolved' }),
      closed: await Complaint.countDocuments({ user_id: req.user._id, status: 'Closed' })
    };

    return sendSuccess(res, 200, 'Complaints retrieved successfully', {
      complaints,
      counts
    });
  } catch (error) {
    console.error('Error fetching citizen complaints:', error);
    return sendError(res, 500, 'Error fetching complaints.', error.message);
  }
};
exports.getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    let complaint = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      complaint = await Complaint.findById(id)
        .populate('user_id', 'name email phone address')
        .populate('assigned_staff_id', 'name email phone');
    } else {
      complaint = await Complaint.findOne({ complaint_id: id.toUpperCase() })
        .populate('user_id', 'name email phone address')
        .populate('assigned_staff_id', 'name email phone');
    }

    if (!complaint) {
      return sendError(res, 404, 'Complaint not found.');
    }
    if (req.user.role === 'citizen' && complaint.user_id._id.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Access denied. You can only view your own complaints.');
    }
    const updates = await ComplaintUpdate.find({ complaint_id: complaint._id })
      .populate('staff_id', 'name email role')
      .sort({ updated_at: 1 });

    return sendSuccess(res, 200, 'Complaint details retrieved', {
      complaint,
      updates
    });
  } catch (error) {
    console.error('Error getting complaint:', error);
    return sendError(res, 500, 'Error retrieving complaint.', error.message);
  }
};
exports.trackComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    if (!complaintId) {
      return sendError(res, 400, 'Complaint ID is required.');
    }

    const complaint = await Complaint.findOne({ complaint_id: complaintId.trim().toUpperCase() })
      .populate('user_id', 'name email')
      .populate('assigned_staff_id', 'name phone email');

    if (!complaint) {
      return sendError(res, 404, `Complaint "${complaintId}" not found. Please verify the ID.`);
    }

    const updates = await ComplaintUpdate.find({ complaint_id: complaint._id })
      .populate('staff_id', 'name role')
      .sort({ updated_at: 1 });

    return sendSuccess(res, 200, 'Complaint tracking data retrieved', {
      complaint,
      updates
    });
  } catch (error) {
    console.error('Error tracking complaint:', error);
    return sendError(res, 500, 'Error tracking complaint.', error.message);
  }
};
exports.getComplaintHistory = async (req, res) => {
  try {
    const { id } = req.params;

    let complaintId = id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      const comp = await Complaint.findOne({ complaint_id: id.toUpperCase() });
      if (!comp) return sendError(res, 404, 'Complaint not found.');
      complaintId = comp._id;
    }

    const updates = await ComplaintUpdate.find({ complaint_id: complaintId })
      .populate('staff_id', 'name role')
      .sort({ updated_at: 1 });

    return sendSuccess(res, 200, 'Complaint history retrieved', { updates });
  } catch (error) {
    return sendError(res, 500, 'Error fetching complaint history.', error.message);
  }
};
exports.updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, landmark } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found.');
    }

    if (complaint.user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'Unauthorized to edit this complaint.');
    }

    if (complaint.status !== 'Submitted' && req.user.role !== 'admin') {
      return sendError(res, 400, 'Cannot edit complaint once processing has started.');
    }

    if (title) complaint.title = title;
    if (description) complaint.description = description;
    if (location) complaint.location = location;
    if (landmark !== undefined) complaint.landmark = landmark;

    if (req.file) {
      complaint.image = `/uploads/${req.file.filename}`;
    }

    complaint.updated_at = Date.now();
    await complaint.save();

    return sendSuccess(res, 200, 'Complaint updated successfully', { complaint });
  } catch (error) {
    return sendError(res, 500, 'Error updating complaint.', error.message);
  }
};
exports.deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found.');
    }

    if (complaint.user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 403, 'Unauthorized to delete this complaint.');
    }

    await ComplaintUpdate.deleteMany({ complaint_id: complaint._id });
    await Complaint.findByIdAndDelete(id);

    return sendSuccess(res, 200, 'Complaint deleted successfully');
  } catch (error) {
    return sendError(res, 500, 'Error deleting complaint.', error.message);
  }
};