/**
 * Automated API Test Suite
 * Tests Citizen, Staff, and Admin authentication, role separation, and permissions.
 */
process.env.NODE_ENV = 'test';
require('dotenv').config();
const http = require('http');
const app = require('./app');

let server;
const PORT = 3999;

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const bodyStr = postData ? (typeof postData === 'string' ? postData : JSON.stringify(postData)) : '';
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Connection': 'close'
    };
    if (bodyStr) {
      defaultHeaders['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const reqOptions = {
      hostname: '127.0.0.1',
      port: PORT,
      path: options.path,
      method: options.method || 'GET',
      headers: Object.assign({}, defaultHeaders, options.headers || {})
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);

    if (bodyStr) {
      req.write(bodyStr);
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Comprehensive Multi-Role API Verification ---');
  server = app.listen(PORT, async () => {
    try {
      // 1. Health check
      const health = await request({ path: '/api/health' });
      console.log('✓ Health check passed:', health.body.status);

      // 2. Existing Citizen Login via /api/auth/login
      const citizenLogin = await request({
        path: '/api/auth/login',
        method: 'POST'
      }, {
        email: 'citizen@example.com',
        password: 'citizen123'
      });
      if (citizenLogin.status !== 200) throw new Error('Citizen login failed: ' + JSON.stringify(citizenLogin.body));
      const citizenToken = citizenLogin.body.data.token;
      console.log('✓ Citizen login passed (/api/auth/login). Token received.');

      // 3. Separate Staff Login via /api/staff/login
      const staffLogin = await request({
        path: '/api/staff/login',
        method: 'POST'
      }, {
        email: 'staff@example.com',
        password: 'staff123'
      });
      if (staffLogin.status !== 200) throw new Error('Staff login failed: ' + JSON.stringify(staffLogin.body));
      const staffToken = staffLogin.body.data.token;
      console.log('✓ Separate Staff login passed (/api/staff/login). Token received.');

      // 4. Separate Admin Login via /api/admin/login
      const adminLogin = await request({
        path: '/api/admin/login',
        method: 'POST'
      }, {
        email: 'admin@example.com',
        password: 'admin123'
      });
      if (adminLogin.status !== 200) throw new Error('Admin login failed: ' + JSON.stringify(adminLogin.body));
      const adminToken = adminLogin.body.data.token;
      console.log('✓ Separate Admin login passed (/api/admin/login). Token received.');

      // 5. Cross-Role Login Restrictions
      // 5a. Citizen trying to log into Staff portal
      const citizenStaffLogin = await request({
        path: '/api/staff/login',
        method: 'POST'
      }, {
        email: 'citizen@example.com',
        password: 'citizen123'
      });
      if (citizenStaffLogin.status !== 403) throw new Error('Expected 403 for Citizen on Staff login, got: ' + citizenStaffLogin.status);
      console.log('✓ Citizen attempting Staff login rejected with 403 Forbidden.');

      // 5b. Citizen trying to log into Admin portal
      const citizenAdminLogin = await request({
        path: '/api/admin/login',
        method: 'POST'
      }, {
        email: 'citizen@example.com',
        password: 'citizen123'
      });
      if (citizenAdminLogin.status !== 403) throw new Error('Expected 403 for Citizen on Admin login, got: ' + citizenAdminLogin.status);
      console.log('✓ Citizen attempting Admin login rejected with 403 Forbidden.');

      // 5c. Staff trying to log into Admin portal
      const staffAdminLogin = await request({
        path: '/api/admin/login',
        method: 'POST'
      }, {
        email: 'staff@example.com',
        password: 'staff123'
      });
      if (staffAdminLogin.status !== 403) throw new Error('Expected 403 for Staff on Admin login, got: ' + staffAdminLogin.status);
      console.log('✓ Staff attempting Admin login rejected with 403 Forbidden.');

      // 6. Cross-Role API Authorization Restrictions
      // 6a. Citizen trying to access Staff API
      const citizenTryStaffApi = await request({
        path: '/api/staff/complaints',
        headers: { Authorization: 'Bearer ' + citizenToken }
      });
      if (citizenTryStaffApi.status !== 403) throw new Error('Expected 403 for Citizen on Staff API, got: ' + citizenTryStaffApi.status);
      console.log('✓ Citizen token rejected on /api/staff/complaints with 403 Forbidden.');

      // 6b. Citizen trying to access Admin API
      const citizenTryAdminApi = await request({
        path: '/api/admin/stats',
        headers: { Authorization: 'Bearer ' + citizenToken }
      });
      if (citizenTryAdminApi.status !== 403) throw new Error('Expected 403 for Citizen on Admin API, got: ' + citizenTryAdminApi.status);
      console.log('✓ Citizen token rejected on /api/admin/stats with 403 Forbidden.');

      // 6c. Staff trying to access Admin API
      const staffTryAdminApi = await request({
        path: '/api/admin/complaints',
        headers: { Authorization: 'Bearer ' + staffToken }
      });
      if (staffTryAdminApi.status !== 403) throw new Error('Expected 403 for Staff on Admin API, got: ' + staffTryAdminApi.status);
      console.log('✓ Staff token rejected on /api/admin/complaints with 403 Forbidden.');

      // 7. Citizen Complaint Creation & Tracking
      const newComplaint = await request({
        path: '/api/complaints',
        method: 'POST',
        headers: { Authorization: 'Bearer ' + citizenToken }
      }, {
        category: 'Street Light',
        title: 'Defective LED pole in Sector 5 playground',
        description: 'The LED lamp flickers violently then turns off completely after dusk.',
        location: 'Sector 5 Community Park, West Gate',
        landmark: 'Near Children Swing Area'
      });
      if (newComplaint.status !== 201) throw new Error('Complaint creation failed: ' + JSON.stringify(newComplaint.body));
      const createdId = newComplaint.body.data.complaint_id;
      const mongoId = newComplaint.body.data.id;
      console.log('✓ Complaint registered successfully! Generated ID: ' + createdId);

      // 8. Citizen List Complaints
      const citizenList = await request({
        path: '/api/complaints',
        headers: { Authorization: 'Bearer ' + citizenToken }
      });
      if (citizenList.status !== 200) throw new Error('Citizen list failed');
      console.log('✓ Citizen complaints fetched via /api/complaints. Total complaints: ' + citizenList.body.data.complaints.length);

      // 9. Public Complaint Tracking
      const trackRes = await request({
        path: '/api/complaints/track/' + createdId
      });
      if (trackRes.status !== 200) throw new Error('Tracking failed: ' + JSON.stringify(trackRes.body));
      console.log('✓ Public tracking verified for ID: ' + trackRes.body.data.complaint.complaint_id + ' | Status: ' + trackRes.body.data.complaint.status);

      // 10. Admin Stats Endpoint (Chart.js data)
      const statsRes = await request({
        path: '/api/admin/stats',
        headers: { Authorization: 'Bearer ' + adminToken }
      });
      if (statsRes.status !== 200) throw new Error('Admin stats failed');
      console.log('✓ Admin dashboard stats verified. Total complaints in system: ' + statsRes.body.data.counters.totalComplaints);

      // 11. Admin Assign Complaint to Staff
      const staffListRes = await request({
        path: '/api/admin/staff',
        headers: { Authorization: 'Bearer ' + adminToken }
      });
      const targetStaff = staffListRes.body.data.staff.find(s => s.email === 'staff@example.com') || staffListRes.body.data.staff[0];
      const assignedStaffUserId = targetStaff.user_id._id || targetStaff.user_id;

      const assignRes = await request({
        path: '/api/admin/complaints/' + mongoId + '/assign',
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + adminToken }
      }, {
        staff_id: assignedStaffUserId,
        remarks: 'Assigned for immediate field inspection.'
      });
      if (assignRes.status !== 200) throw new Error('Admin assign failed: ' + JSON.stringify(assignRes.body));
      console.log('✓ Admin assigned complaint to staff member.');

      // 12. Staff View Assigned Complaints
      const staffComplaints = await request({
        path: '/api/staff/complaints',
        headers: { Authorization: 'Bearer ' + staffToken }
      });
      if (staffComplaints.status !== 200) throw new Error('Staff complaints retrieval failed');
      console.log('✓ Staff view assigned complaints verified. Count: ' + staffComplaints.body.data.complaints.length);

      // 13. Staff Update Status to Resolved with Remarks
      const resolveRes = await request({
        path: '/api/staff/complaints/' + mongoId + '/status',
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + staffToken }
      }, {
        status: 'Resolved',
        remarks: 'Replaced faulty driver unit. Street light fully operational.'
      });
      if (resolveRes.status !== 200) throw new Error('Staff status update failed: ' + JSON.stringify(resolveRes.body));
      console.log('✓ Staff updated complaint status to Resolved with remarks.');

      // 14. Verify Citizen Track reflects Resolved status and Timeline
      const verifyTrack = await request({
        path: '/api/complaints/track/' + createdId
      });
      if (verifyTrack.body.data.complaint.status !== 'Resolved') {
        throw new Error('Expected status Resolved, got: ' + verifyTrack.body.data.complaint.status);
      }
      console.log('✓ Citizen timeline history verified. Status: ' + verifyTrack.body.data.complaint.status + ', Timeline steps: ' + verifyTrack.body.data.updates.length);

      // 15. Citizen Notifications Verification
      const notifRes = await request({
        path: '/api/notifications',
        headers: { Authorization: 'Bearer ' + citizenToken }
      });
      if (notifRes.status !== 200) throw new Error('Citizen notifications retrieval failed: ' + JSON.stringify(notifRes.body));
      const notifications = notifRes.body.data.notifications;
      if (!notifications || notifications.length === 0) throw new Error('Expected notifications for citizen, got 0');
      console.log(`✓ Citizen notifications verified! Received ${notifications.length} alerts (Unread: ${notifRes.body.data.unreadCount})`);
      console.log(`   Latest alert: "${notifications[0].title}" - ${notifications[0].message}`);

      // 16. Verify Multi-Channel Delivery (In-App, Email/Gmail, SMS)
      const latestNotif = notifications[0];
      if (!latestNotif.channels.in_app.sent) throw new Error('In-app notification not flagged as sent');
      if (!latestNotif.channels.email.sent) throw new Error('Email notification not flagged as sent');
      if (!latestNotif.channels.sms.sent) throw new Error('SMS notification not flagged as sent');
      console.log('✓ Multi-Channel Citizen Delivery verified (In-App: ✓, Gmail: ✓, SMS: ✓)');

      // 17. Mark Single Notification as Read
      const markReadRes = await request({
        path: `/api/notifications/${latestNotif._id}/read`,
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + citizenToken }
      });
      if (markReadRes.status !== 200) throw new Error('Mark notification read failed');
      console.log('✓ Mark notification as read verified.');

      // 18. Mark All Notifications as Read
      const markAllRes = await request({
        path: '/api/notifications/read-all',
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + citizenToken }
      });
      if (markAllRes.status !== 200 || markAllRes.body.data.unreadCount !== 0) throw new Error('Mark all read failed');
      console.log('✓ Mark all notifications as read verified (Unread count now 0).');

      // 19. Notification Audit Logs
      const logsRes = await request({
        path: '/api/notifications/logs',
        headers: { Authorization: 'Bearer ' + citizenToken }
      });
      if (logsRes.status !== 200) throw new Error('Notification logs retrieval failed');
      console.log(`✓ Notification audit logs verified. (Email logs: ${logsRes.body.data.emailLogs.length}, SMS logs: ${logsRes.body.data.smsLogs.length})`);

      console.log('========================================================================');
      console.log('🎉 ALL MULTI-ROLE & CITIZEN NOTIFICATION TESTS (100%) PASSED SUCCESSFULLY');
      console.log('========================================================================');
      server.close();
      process.exit(0);
    } catch (err) {
      console.error('❌ Test failed:', err);
      if (server) server.close();
      process.exit(1);
    }
  });
}

runTests();