const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { complaintValidation } = require('../middleware/validatorMiddleware');


router.get('/track/:complaintId', complaintController.trackComplaint);

router.post('/', authenticateJWT, upload.single('image'), complaintValidation, complaintController.createComplaint);
router.get('/', authenticateJWT, complaintController.getCitizenComplaints);
router.get('/:id', authenticateJWT, complaintController.getComplaintById);
router.get('/:id/history', authenticateJWT, complaintController.getComplaintHistory);
router.put('/:id', authenticateJWT, upload.single('image'), complaintController.updateComplaint);
router.delete('/:id', authenticateJWT, complaintController.deleteComplaint);

module.exports = router;