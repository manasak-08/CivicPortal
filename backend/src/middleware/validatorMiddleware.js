const { body, validationResult } = require('express-validator');
const { sendError } = require('../utils/responseHandler');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return sendError(res, 400, formattedErrors[0].message, formattedErrors);
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Full name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').trim().notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address'),
  body('phone').trim().notEmpty().withMessage('Phone number is required')
    .isLength({ min: 7 }).withMessage('Please provide a valid phone number'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').optional({ checkFalsy: true }).custom((value, { req }) => {
    if (value && req.body.password && value.toString().trim() !== req.body.password.toString().trim()) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  validate
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const complaintValidation = [
  body('category').trim().notEmpty().withMessage('Please select a complaint category')
    .isIn(['Street Light', 'Water Pipe Leakage', 'Rain Water Drainage', 'Roadside Cleaning'])
    .withMessage('Invalid complaint category selected'),
  body('title').trim().notEmpty().withMessage('Complaint title is required')
    .isLength({ min: 4, max: 120 }).withMessage('Title must be between 4 and 120 characters'),
  body('description').trim().notEmpty().withMessage('Complaint description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  validate
];

const statusUpdateValidation = [
  body('status').trim().notEmpty().withMessage('Status is required')
    .isIn(['Submitted', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'])
    .withMessage('Invalid status value'),
  body('remarks').trim().notEmpty().withMessage('Remarks are required')
    .isLength({ min: 3 }).withMessage('Remarks must be at least 3 characters'),
  validate
];

const assignStaffValidation = [
  body('staff_id').trim().notEmpty().withMessage('Staff ID is required'),
  body('remarks').optional().trim(),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  complaintValidation,
  statusUpdateValidation,
  assignStaffValidation
};