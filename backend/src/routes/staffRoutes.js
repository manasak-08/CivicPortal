const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { statusUpdateValidation, loginValidation } = require('../middleware/validatorMiddleware');
const { requireStaff } = require('../middleware/roleMiddleware');

// Public Staff Login route
router.post('/login', loginValidation, staffController.staffLogin);

// Protected Staff-Only routes
router.use(authenticateJWT, requireStaff);

router.get('/complaints', staffController.getAssignedComplaints);
router.put('/complaints/:id/status', statusUpdateValidation, staffController.updateStatus);

module.exports = router;