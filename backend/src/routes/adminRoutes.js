const express = require('express');

const router = express.Router();

const adminController = require('../controllers/adminController');

const { authenticateJWT } = require('../middleware/authMiddleware');

const {
  statusUpdateValidation,
  assignStaffValidation,
  loginValidation
} = require('../middleware/validatorMiddleware');

const { requireAdmin } = require('../middleware/roleMiddleware');

// ===============================
// PUBLIC ADMIN ROUTES
// ===============================

// Admin Login
router.post('/login', loginValidation, adminController.adminLogin);

// Admin Registration
router.post('/register', adminController.adminRegister);


// ===============================
// PROTECTED ADMIN ROUTES
// ===============================

router.use(authenticateJWT, requireAdmin);

// Complaints
router.get('/complaints', adminController.getAllComplaints);

// Dashboard Statistics
router.get('/stats', adminController.getDashboardStats);

// Users
router.get('/users', adminController.getUsers);

// Staff
router.get('/staff', adminController.getStaff);

// Create Staff
router.post('/staff', adminController.createStaff);

// Assign Staff to Complaint
router.put(
  '/complaints/:id/assign',
  assignStaffValidation,
  adminController.assignStaff
);

// Update Complaint Status
router.put(
  '/complaints/:id/status',
  statusUpdateValidation,
  adminController.updateStatus
);

// Delete Complaint
router.delete('/complaints/:id', adminController.deleteComplaint);

module.exports = router;