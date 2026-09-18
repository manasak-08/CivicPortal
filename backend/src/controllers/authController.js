const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Staff = require('../models/Staff');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'complaint_system_jwt_super_secret_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, address, password, role, department } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 400, 'An account with this email address already exists.');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const assignedRole = ['citizen', 'staff', 'admin'].includes(role) ? role : 'citizen';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      address,
      password: hashedPassword,
      role: assignedRole
    });

    if (assignedRole === 'staff') {
      await Staff.create({
        user_id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: department || 'General Civic Services'
      });
    }

    const token = generateToken(user);

    return sendSuccess(res, 201, 'User registered successfully!', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return sendError(res, 500, 'Server error during registration.', error.message);
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

  
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const token = generateToken(user);

    return sendSuccess(res, 200, 'Login successful!', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 500, 'Server error during login.', error.message);
  }
};

exports.getMe = async (req, res) => {
  try {
    let staffProfile = null;
    if (req.user.role === 'staff') {
      staffProfile = await Staff.findOne({ user_id: req.user._id });
    }

    return sendSuccess(res, 200, 'Profile fetched successfully', {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        address: req.user.address,
        role: req.user.role,
        department: staffProfile ? staffProfile.department : null
      }
    });
  } catch (error) {
    return sendError(res, 500, 'Error retrieving profile.', error.message);
  }
};