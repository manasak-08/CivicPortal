const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Complaint = require('../models/Complaint');
const ComplaintUpdate = require('../models/ComplaintUpdate');
const User = require('../models/User');
const Staff = require('../models/Staff');

const { sendSuccess, sendError } = require('../utils/responseHandler');
const { sendCitizenNotification } = require('../utils/notificationService');


// ============================================================
// ADMIN REGISTRATION
// POST /api/admin/register
// ============================================================
exports.adminRegister = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password
    } = req.body;

    // Required fields
    if (!name || !email || !password) {
      return sendError(
        res,
        400,
        'Name, email and password are required.'
      );
    }

    // Password length
    if (password.length < 6) {
      return sendError(
        res,
        400,
        'Password must be at least 6 characters.'
      );
    }

    // Check existing account
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingUser) {
      return sendError(
        res,
        400,
        'An account with this email already exists.'
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
      role: 'admin'
    });

    return sendSuccess(
      res,
      201,
      'Admin registered successfully.',
      {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          role: admin.role
        }
      }
    );

  } catch (error) {
    console.error('Admin registration error:', error);

    return sendError(
      res,
      500,
      'Server error during admin registration.',
      error.message
    );
  }
};


// ============================================================
// ADMIN LOGIN
// POST /api/admin/login
// ============================================================
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return sendError(
        res,
        401,
        'Invalid email or password.'
      );
    }

    // Role verification: Admin only
    if (user.role !== 'admin') {
      return sendError(
        res,
        403,
        'Access denied. Only administrators can log in through the Admin Portal.'
      );
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return sendError(
        res,
        401,
        'Invalid email or password.'
      );
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET ||
        'complaint_system_jwt_super_secret_key_2026',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    );

    return sendSuccess(
      res,
      200,
      'Admin login successful!',
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      }
    );

  } catch (error) {
    console.error('Admin login error:', error);

    return sendError(
      res,
      500,
      'Server error during admin login.',
      error.message
    );
  }
};


// ============================================================
// GET ALL COMPLAINTS
// GET /api/admin/complaints
// ============================================================
exports.getAllComplaints = async (req, res) => {
  try {
    const {
      status,
      search
    } = req.query;

    const query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search
    if (search) {
      query.$or = [
        {
          complaint_id: {
            $regex: search,
            $options: 'i'
          }
        },
        {
          title: {
            $regex: search,
            $options: 'i'
          }
        },
        {
          location: {
            $regex: search,
            $options: 'i'
          }
        },
        {
          category: {
            $regex: search,
            $options: 'i'
          }
        }
      ];
    }

    const complaints = await Complaint.find(query)
      .populate(
        'user_id',
        'name email phone address'
      )
      .populate(
        'assigned_staff_id',
        'name email phone department'
      )
      .sort({
        created_at: -1
      });

    return sendSuccess(
      res,
      200,
      'All complaints retrieved successfully',
      {
        complaints
      }
    );

  } catch (error) {
    console.error(
      'Admin getAllComplaints error:',
      error
    );

    return sendError(
      res,
      500,
      'Error retrieving complaints.',
      error.message
    );
  }
};


// ============================================================
// GET DASHBOARD STATISTICS
// GET /api/admin/dashboard/stats
// ============================================================
exports.getDashboardStats = async (req, res) => {
  try {

    const totalUsers =
      await User.countDocuments({
        role: 'citizen'
      });

    const totalStaff =
      await User.countDocuments({
        role: 'staff'
      });

    const totalComplaints =
      await Complaint.countDocuments();

    const pending =
      await Complaint.countDocuments({
        status: {
          $in: [
            'Submitted',
            'Pending'
          ]
        }
      });

    const assigned =
      await Complaint.countDocuments({
        status: 'Assigned'
      });

    const inProgress =
      await Complaint.countDocuments({
        status: 'In Progress'
      });

    const resolved =
      await Complaint.countDocuments({
        status: 'Resolved'
      });

    const closed =
      await Complaint.countDocuments({
        status: 'Closed'
      });

    const rejected =
      await Complaint.countDocuments({
        status: 'Rejected'
      });


    // ========================================================
    // CATEGORY BREAKDOWN
    // ========================================================

    const categories = [
      'Street Light',
      'Water Pipe Leakage',
      'Rain Water Drainage',
      'Roadside Cleaning'
    ];

    const categoryCounts = {};

    for (const cat of categories) {

      categoryCounts[cat] =
        await Complaint.countDocuments({
          category: cat
        });

    }


    // ========================================================
    // STATUS BREAKDOWN
    // ========================================================

    const statusCounts = {

      Submitted:
        await Complaint.countDocuments({
          status: 'Submitted'
        }),

      Pending:
        await Complaint.countDocuments({
          status: 'Pending'
        }),

      Assigned: assigned,

      'In Progress': inProgress,

      Resolved: resolved,

      Closed: closed,

      Rejected: rejected

    };


    // ========================================================
    // MONTHLY BREAKDOWN - LAST 6 MONTHS
    // ========================================================

    const months = [];
    const monthlyCounts = [];

    const now = new Date();

    for (let i = 5; i >= 0; i--) {

      const d = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const nextD = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        1
      );

      const monthLabel =
        d.toLocaleString(
          'default',
          {
            month: 'short',
            year: '2-digit'
          }
        );

      months.push(monthLabel);


      const count =
        await Complaint.countDocuments({
          created_at: {
            $gte: d,
            $lt: nextD
          }
        });

      monthlyCounts.push(count);

    }


    // ========================================================
    // COUNTERS
    // ========================================================

    const counters = {

      totalUsers,

      totalStaff,

      totalComplaints,

      pending,

      assigned,

      inProgress,

      resolved,

      closed,

      rejected

    };


    return sendSuccess(
      res,
      200,
      'Dashboard statistics retrieved successfully',
      {

        counters,

        counts: counters,

        charts: {

          categoryCounts,

          statusCounts,

          monthly: {

            labels: months,

            data: monthlyCounts

          }

        }

      }
    );

  } catch (error) {

    console.error(
      'Admin getDashboardStats error:',
      error
    );

    return sendError(
      res,
      500,
      'Error retrieving dashboard statistics.',
      error.message
    );

  }
};


// ============================================================
// GET USERS
// GET /api/admin/users
// ============================================================
exports.getUsers = async (req, res) => {
  try {

    const users =
      await User.find()
        .select('-password')
        .sort({
          created_at: -1
        });

    return sendSuccess(
      res,
      200,
      'Users retrieved successfully',
      {
        users
      }
    );

  } catch (error) {

    console.error(
      'Admin getUsers error:',
      error
    );

    return sendError(
      res,
      500,
      'Error retrieving users.',
      error.message
    );

  }
};


// ============================================================
// GET STAFF
// GET /api/admin/staff
// ============================================================
exports.getStaff = async (req, res) => {
  try {

    const staff =
      await Staff.find()
        .sort({
          created_at: -1
        });

    return sendSuccess(
      res,
      200,
      'Staff retrieved successfully',
      {
        staff
      }
    );

  } catch (error) {

    console.error(
      'Admin getStaff error:',
      error
    );

    return sendError(
      res,
      500,
      'Error retrieving staff.',
      error.message
    );

  }
};


// ============================================================
// CREATE STAFF
// POST /api/admin/staff
// ============================================================
exports.createStaff = async (req, res) => {
  try {

    const {
      name,
      email,
      phone,
      password,
      department
    } = req.body;


    if (!name || !email || !password) {

      return sendError(
        res,
        400,
        'Name, email and password are required.'
      );

    }


    const existingUser =
      await User.findOne({
        email: email.toLowerCase()
      });


    if (existingUser) {

      return sendError(
        res,
        400,
        'An account with this email already exists.'
      );

    }


    const salt =
      await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(
        password,
        salt
      );


    const user =
      await User.create({

        name,

        email: email.toLowerCase(),

        phone,

        password: hashedPassword,

        role: 'staff'

      });


    const staff =
      await Staff.create({

        user_id: user._id,

        name: user.name,

        email: user.email,

        phone: user.phone,

        department:
          department ||
          'General Civic Services'

      });


    return sendSuccess(
      res,
      201,
      'Staff created successfully',
      {
        staff
      }
    );

  } catch (error) {

    console.error(
      'Admin createStaff error:',
      error
    );

    return sendError(
      res,
      500,
      'Error creating staff.',
      error.message
    );

  }
};


// ============================================================
// ASSIGN STAFF
// PUT /api/admin/complaints/:id/assign
// ============================================================
exports.assignStaff = async (req, res) => {
  try {

    const {
      id
    } = req.params;

    const {
      staff_id
    } = req.body;


    if (!staff_id) {

      return sendError(
        res,
        400,
        'Staff ID is required.'
      );

    }


    const complaint =
      await Complaint.findById(id);


    if (!complaint) {

      return sendError(
        res,
        404,
        'Complaint not found.'
      );

    }


    let staff = null;


    if (
      staff_id &&
      staff_id
        .toString()
        .match(/^[0-9a-fA-F]{24}$/)
    ) {

      staff =
        await Staff.findById(staff_id) ||
        await Staff.findOne({
          user_id: staff_id
        });


      if (!staff) {

        const staffUser =
          await User.findOne({
            _id: staff_id,
            role: 'staff'
          });


        if (staffUser) {

          staff =
            await Staff.findOne({
              user_id: staffUser._id
            }) ||
            {
              _id: staffUser._id,
              user_id: staffUser._id,
              name: staffUser.name
            };

        }

      }

    }


    if (!staff) {

      return sendError(
        res,
        404,
        'Staff member not found.'
      );

    }


    complaint.assigned_staff_id =
      staff.user_id || staff._id;

    complaint.status =
      'Assigned';

    complaint.updated_at =
      Date.now();


    await complaint.save();


    // Create complaint update
    await ComplaintUpdate.create({

      complaint_id:
        complaint._id,

      staff_id:
        staff.user_id || staff._id,

      status:
        'Assigned',

      remarks:
        `Complaint assigned to ${staff.name} by admin.`

    });


    // ========================================================
    // NOTIFY CITIZEN
    // In-App + Email + SMS
    // ========================================================

    await sendCitizenNotification({

      userId:
        complaint.user_id,

      complaint:
        complaint,

      title:
        'Field Staff Assigned',

      message:
        `Your complaint ${complaint.complaint_id} has been assigned to ${staff.name} (${staff.department || 'Civic Services'}) for inspection.`,

      type:
        'assigned',

      actionBy: {

        name:
          req.user.name ||
          'Municipal Admin',

        role:
          'admin',

        department:
          'Administration'

      },

      remarks:
        `Assigned to ${staff.name}`

    });


    const updatedComplaint =
      await Complaint.findById(
        complaint._id
      )
        .populate(
          'user_id',
          'name email phone address'
        )
        .populate(
          'assigned_staff_id',
          'name email phone'
        );


    return sendSuccess(
      res,
      200,
      'Complaint assigned successfully',
      {
        complaint:
          updatedComplaint
      }
    );

  } catch (error) {

    console.error(
      'Admin assignStaff error:',
      error
    );

    return sendError(
      res,
      500,
      'Error assigning staff.',
      error.message
    );

  }
};


// ============================================================
// UPDATE COMPLAINT STATUS
// PUT /api/admin/complaints/:id/status
// ============================================================
exports.updateStatus = async (req, res) => {
  try {

    const {
      id
    } = req.params;

    const {
      status,
      remarks
    } = req.body;


    if (!status) {

      return sendError(
        res,
        400,
        'Status is required.'
      );

    }


    const complaint =
      await Complaint.findById(id);


    if (!complaint) {

      return sendError(
        res,
        404,
        'Complaint not found.'
      );

    }


    complaint.status =
      status;

    complaint.updated_at =
      Date.now();


    await complaint.save();


    // ========================================================
    // COMPLAINT UPDATE
    // ========================================================

    const updateData = {

      complaint_id:
        complaint._id,

      status,

      remarks:
        remarks ||
        `Status updated to ${status} by admin.`

    };


    // Use assigned staff if available
    // Otherwise use admin user

    if (complaint.assigned_staff_id) {

      updateData.staff_id =
        complaint.assigned_staff_id;

    } else {

      updateData.staff_id =
        req.user._id;

    }


    await ComplaintUpdate.create(
      updateData
    );


    // ========================================================
    // NOTIFY CITIZEN
    // In-App + Email + SMS
    // ========================================================

    await sendCitizenNotification({

      userId:
        complaint.user_id,

      complaint:
        complaint,

      title:
        `Status Updated: ${status}`,

      message:
        `The status of your complaint ${complaint.complaint_id} was updated to "${status}" by municipal administration. ${remarks ? `Remarks: ${remarks}` : ''}`,

      type:
        status === 'Resolved'
          ? 'resolved'
          : 'status_update',

      actionBy: {

        name:
          req.user.name ||
          'Municipal Admin',

        role:
          'admin',

        department:
          'Administration'

      },

      remarks:
        remarks ||
        `Status set to ${status}`

    });


    return sendSuccess(
      res,
      200,
      `Complaint status updated to ${status}.`,
      {
        complaint
      }
    );

  } catch (error) {

    console.error(
      'Admin updateStatus error:',
      error
    );

    return sendError(
      res,
      500,
      'Error updating complaint status.',
      error.message
    );

  }
};


// ============================================================
// DELETE COMPLAINT
// DELETE /api/admin/complaints/:id
// ============================================================
exports.deleteComplaint = async (req, res) => {
  try {

    const {
      id
    } = req.params;


    const complaint =
      await Complaint.findById(id);


    if (!complaint) {

      return sendError(
        res,
        404,
        'Complaint not found.'
      );

    }


    // Delete complaint updates
    await ComplaintUpdate.deleteMany({

      complaint_id:
        complaint._id

    });


    // Delete complaint
    await Complaint.findByIdAndDelete(
      id
    );


    return sendSuccess(
      res,
      200,
      'Complaint deleted successfully'
    );

  } catch (error) {

    console.error(
      'Admin deleteComplaint error:',
      error
    );

    return sendError(
      res,
      500,
      'Error deleting complaint.',
      error.message
    );

  }
};