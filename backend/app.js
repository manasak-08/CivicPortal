/**
 * Online Complaint Registration and Management System
 * Express Application Entry Point
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const connectDB = require('./src/db/connection');

// ===============================
// ROUTE IMPORTS
// ===============================

const authRoutes = require('./src/routes/authRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const staffRoutes = require('./src/routes/staffRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');


// ===============================
// CREATE EXPRESS APP
// ===============================

const app = express();

const PORT = process.env.PORT || 3000;


// ===============================
// CONNECT TO MONGODB
// ===============================

connectDB();


// ===============================
// MIDDLEWARE
// ===============================

// Enable CORS
app.use(cors());

// Parse JSON requests
app.use(express.json());

// Parse form data
app.use(express.urlencoded({ extended: true }));


// ===============================
// CREATE REQUIRED DIRECTORIES
// ===============================

// Uploads directory
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Logs directory
const logsDir = path.join(__dirname, 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}


// ===============================
// SERVE UPLOADED FILES
// ===============================

app.use('/uploads', express.static(uploadsDir));


// ===============================
// SERVE FRONTEND
// ===============================

const frontendDir = path.join(__dirname, '../frontend');

app.use(express.static(frontendDir));


// ===============================
// API ROUTES
// ===============================

// Citizen Authentication
app.use('/api/auth', authRoutes);

// Complaint APIs
app.use('/api/complaints', complaintRoutes);

// Citizen Complaint API Alias
app.use('/api/citizen', complaintRoutes);

// Admin APIs
// Includes:
// POST /api/admin/login
// POST /api/admin/register
// GET  /api/admin/complaints
// GET  /api/admin/stats
// GET  /api/admin/users
// GET  /api/admin/staff
app.use('/api/admin', adminRoutes);

// Staff APIs
app.use('/api/staff', staffRoutes);

// Notification APIs
app.use('/api/notifications', notificationRoutes);


// ===============================
// HEALTH CHECK
// ===============================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'Online Complaint Registration & Management System',
    timestamp: new Date().toISOString()
  });
});


// ===============================
// HOME PAGE
// ===============================

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});


// ===============================
// GLOBAL ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  // Multer file upload error
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  // General server error
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});


// ===============================
// START SERVER
// ===============================

if (process.env.NODE_ENV !== 'test') {

  app.listen(PORT, '0.0.0.0', () => {

    console.log('====================================================');

    console.log(
      `🚀 Server running on: http://localhost:${PORT}`
    );

    console.log(
      `🌐 Citizen Portal:     http://localhost:${PORT}/`
    );

    console.log(
      `📝 Citizen Register:   http://localhost:${PORT}/register.html`
    );

    console.log(
      `🔑 Citizen Login:      http://localhost:${PORT}/login.html`
    );

    console.log(
      `📝 Admin Register:     http://localhost:${PORT}/admin-register.html`
    );

    console.log(
      `🔐 Admin Login:        http://localhost:${PORT}/admin-login.html`
    );

    console.log(
      `🛡️ Admin Dashboard:    http://localhost:${PORT}/admin.html`
    );

    console.log(
      `👷 Staff Dashboard:    http://localhost:${PORT}/staff.html`
    );

    console.log(
      `❤️ Health Check:       http://localhost:${PORT}/api/health`
    );

    console.log('====================================================');

  });
}


// ===============================
// EXPORT APP
// ===============================

module.exports = app;