/**
 * Online Complaint Registration and Management System
 * Notification Routes
 */
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// All notification routes require authenticated user
router.use(authenticateJWT);

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);
router.get('/logs', notificationController.getNotificationLogs);

module.exports = router;