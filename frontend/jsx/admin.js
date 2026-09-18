/**
 * Admin Dashboard Component (React JSX)
 * Complete Municipal Administration Dashboard with Chart.js analytics,
 * staff assignment, status updates, citizen alerts, and system user management.
 */
function AdminDashboard() {
  const [user, setUser] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('complaints'); // 'overview', 'complaints', 'staff', 'users', 'logs'
  const [stats, setStats] = React.useState({ counters: {} });
  const [complaints, setComplaints] = React.useState([]);
  const [staffList, setStaffList] = React.useState([]);
  const [usersList, setUsersList] = React.useState([]);
  const [notificationLogs, setNotificationLogs] = React.useState({ emailLogs: [], smsLogs: [] });
  const [loading, setLoading] = React.useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');

  // Modals
  const [assignModalData, setAssignModalData] = React.useState(null);
  const [selectedStaffId, setSelectedStaffId] = React.useState('');
  const [statusModalData, setStatusModalData] = React.useState(null);
  const [newStatus, setNewStatus] = React.useState('In Progress');
  const [remarks, setRemarks] = React.useState('');
  const [createStaffOpen, setCreateStaffOpen] = React.useState(false);
  const [newStaff, setNewStaff] = React.useState({ name: '', email: '', phone: '', department: 'Street Lighting', password: '' });
  const [actionLoading, setActionLoading] = React.useState(false);
  const [alertBanner, setAlertBanner] = React.useState('');

  const chartCategoryRef = React.useRef(null);
  const chartStatusRef = React.useRef(null);
  const categoryChartInstance = React.useRef(null);
  const statusChartInstance = React.useRef(null);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      window.location.href = '/admin-login.html';
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.role !== 'admin') {
        window.location.href = '/admin-login.html';
        return;
      }
      setUser(parsed);
      loadAllAdminData(token);
    } catch (e) {
      window.location.href = '/admin-login.html';
    }
  }, [statusFilter]);

  const loadAllAdminData = async (token) => {
    try {
      setLoading(true);
      // 1. Stats
      const statsRes = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // 2. Complaints
      let compUrl = `/api/admin/complaints?status=${statusFilter}`;
      if (search) compUrl += `&search=${encodeURIComponent(search)}`;
      const compRes = await fetch(compUrl, { headers: { Authorization: `Bearer ${token}` } });
      const compData = await compRes.json();
      if (compData.success) {
        setComplaints(compData.data.complaints || []);
      }

      // 3. Staff
      const staffRes = await fetch('/api/admin/staff', { headers: { Authorization: `Bearer ${token}` } });
      const staffData = await staffRes.json();
      if (staffData.success) {
        setStaffList(staffData.data.staff || []);
      }

      // 4. Users
      const usersRes = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsersList(usersData.data.users || []);
      }

      // 5. Notification Logs
      const logsRes = await fetch('/api/notifications/logs', { headers: { Authorization: `Bearer ${token}` } });
      const logsData = await logsRes.json();
      if (logsData.success) {
        setNotificationLogs(logsData.data);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Render Charts when switching to Overview tab
  React.useEffect(() => {
    if (activeTab === 'overview' && stats?.charts) {
      renderCharts(stats.charts);
    }
    return () => {
      if (categoryChartInstance.current) categoryChartInstance.current.destroy();
      if (statusChartInstance.current) statusChartInstance.current.destroy();
    };
  }, [activeTab, stats]);

  const renderCharts = (charts) => {
    if (typeof Chart === 'undefined') return;

    // Category Doughnut Chart
    if (chartCategoryRef.current) {
      if (categoryChartInstance.current) categoryChartInstance.current.destroy();
      const ctxCat = chartCategoryRef.current.getContext('2d');
      categoryChartInstance.current = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
          labels: Object.keys(charts.categoryCounts || {}),
          datasets: [{
            data: Object.values(charts.categoryCounts || {}),
            backgroundColor: ['#eab308', '#0284c7', '#0d9488', '#ca8a04']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // Status Bar Chart
    if (chartStatusRef.current) {
      if (statusChartInstance.current) statusChartInstance.current.destroy();
      const ctxStat = chartStatusRef.current.getContext('2d');
      statusChartInstance.current = new Chart(ctxStat, {
        type: 'bar',
        data: {
          labels: Object.keys(charts.statusCounts || {}),
          datasets: [{
            label: 'Complaints',
            data: Object.values(charts.statusCounts || {}),
            backgroundColor: '#0f766e',
            borderRadius: 6
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    }
  };

  const handleAssignStaff = async (e) => {
    e.preventDefault();
    if (!assignModalData || !selectedStaffId) return;

    const token = localStorage.getItem('token');
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/complaints/${assignModalData._id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ staff_id: selectedStaffId })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to assign staff.');

      setAlertBanner(`Complaint ${assignModalData.complaint_id} assigned successfully. Citizen alerted via In-App, Gmail & SMS!`);
      setAssignModalData(null);
      loadAllAdminData(token);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusModalData) return;

    const token = localStorage.getItem('token');
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/complaints/${statusModalData._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus, remarks: remarks || `Status set to ${newStatus} by admin.` })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update status.');

      setAlertBanner(`Complaint ${statusModalData.complaint_id} updated to "${newStatus}". Citizen notified.`);
      setStatusModalData(null);
      setRemarks('');
      loadAllAdminData(token);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteComplaint = async (id, code) => {
    if (!confirm(`Are you sure you want to delete complaint ${code}? This action cannot be undone.`)) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/complaints/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete complaint.');

      setAlertBanner(`Complaint ${code} deleted.`);
      loadAllAdminData(token);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newStaff)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create staff.');

      setAlertBanner(`New staff member "${newStaff.name}" added successfully.`);
      setCreateStaffOpen(false);
      setNewStaff({ name: '', email: '', phone: '', department: 'Street Lighting', password: '' });
      loadAllAdminData(token);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const c = stats.counters || {};

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar activePage="admin" />

      <div className="container-fluid px-lg-4 py-4 flex-grow-1">
        {/* Top Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-danger rounded-pill font-monospace text-xs">CENTRAL ADMINISTRATION</span>
              <span className="badge bg-dark rounded-pill text-xs">Municipal Authority</span>
            </div>
            <h3 className="fw-bold text-dark mb-0 mt-1">Administrator Governance Panel</h3>
            <p className="text-secondary small mb-0">
              Logged in as: <strong>{user?.name}</strong> • Real-time oversight, staff dispatching & citizen notifications
            </p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => loadAllAdminData(localStorage.getItem('token'))}>
              <i className="fa-solid fa-arrows-rotate me-1"></i> Refresh Data
            </button>
            <button className="btn btn-teal btn-sm text-white rounded-pill px-3" style={{ backgroundColor: '#0f766e' }} onClick={() => setCreateStaffOpen(true)}>
              <i className="fa-solid fa-user-plus me-1"></i> Add Staff Member
            </button>
          </div>
        </div>

        {alertBanner && (
          <div className="alert alert-success alert-dismissible fade show rounded-4 shadow-sm border-0 d-flex align-items-center gap-2 p-3 mb-4">
            <i className="fa-solid fa-circle-check fs-5 text-success"></i>
            <div>{alertBanner}</div>
            <button type="button" className="btn-close ms-auto" onClick={() => setAlertBanner('')}></button>
          </div>
        )}

        {/* 7 Counter Metric Cards */}
        <div className="row g-3 mb-4">
          <div className="col-lg-3 col-md-4 col-sm-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-primary">
              <small className="text-muted text-uppercase fw-bold text-xs">Total Complaints</small>
              <div className="fs-3 fw-bold text-dark">{c.totalComplaints || 0}</div>
            </div>
          </div>
          <div className="col-lg col-md-4 col-sm-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-warning">
              <small className="text-muted text-uppercase fw-bold text-xs">Pending</small>
              <div className="fs-3 fw-bold text-warning">{c.pending || 0}</div>
            </div>
          </div>
          <div className="col-lg col-md-4 col-sm-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-info">
              <small className="text-muted text-uppercase fw-bold text-xs">Assigned</small>
              <div className="fs-3 fw-bold text-info">{c.assigned || 0}</div>
            </div>
          </div>
          <div className="col-lg col-md-4 col-sm-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-primary">
              <small className="text-muted text-uppercase fw-bold text-xs">In Progress</small>
              <div className="fs-3 fw-bold text-primary">{c.inProgress || 0}</div>
            </div>
          </div>
          <div className="col-lg col-md-4 col-sm-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-success">
              <small className="text-muted text-uppercase fw-bold text-xs">Resolved</small>
              <div className="fs-3 fw-bold text-success">{c.resolved || 0}</div>
            </div>
          </div>
          <div className="col-lg col-md-4 col-sm-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-secondary">
              <small className="text-muted text-uppercase fw-bold text-xs">Closed</small>
              <div className="fs-3 fw-bold text-secondary">{c.closed || 0}</div>
            </div>
          </div>
          <div className="col-lg col-md-4 col-sm-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-dark">
              <small className="text-muted text-uppercase fw-bold text-xs">Citizens</small>
              <div className="fs-3 fw-bold text-dark">{c.totalUsers || 0}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <ul className="nav nav-pills bg-white p-2 rounded-4 shadow-sm mb-4">
          <li className="nav-item">
            <button
              className={`nav-link rounded-pill px-4 py-2 ${activeTab === 'complaints' ? 'active bg-dark text-white' : 'text-secondary'}`}
              onClick={() => setActiveTab('complaints')}
            >
              <i className="fa-solid fa-list-check me-2"></i> Complaints Management ({complaints.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link rounded-pill px-4 py-2 ${activeTab === 'overview' ? 'active bg-dark text-white' : 'text-secondary'}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fa-solid fa-chart-pie me-2"></i> Analytics & Charts
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link rounded-pill px-4 py-2 ${activeTab === 'staff' ? 'active bg-dark text-white' : 'text-secondary'}`}
              onClick={() => setActiveTab('staff')}
            >
              <i className="fa-solid fa-helmet-safety me-2"></i> Staff Directory ({staffList.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link rounded-pill px-4 py-2 ${activeTab === 'users' ? 'active bg-dark text-white' : 'text-secondary'}`}
              onClick={() => setActiveTab('users')}
            >
              <i className="fa-solid fa-users me-2"></i> Citizen Registry ({usersList.filter(u => u.role === 'citizen').length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link rounded-pill px-4 py-2 ${activeTab === 'logs' ? 'active bg-dark text-white' : 'text-secondary'}`}
              onClick={() => setActiveTab('logs')}
            >
              <i className="fa-solid fa-paper-plane me-2"></i> SMS & Email Audit Logs
            </button>
          </li>
        </ul>

        {/* TAB 1: COMPLAINTS MANAGEMENT */}
        {activeTab === 'complaints' && (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div className="card-header bg-white py-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom">
              <h5 className="fw-bold text-dark mb-0">Complaints Registry</h5>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm rounded-pill"
                  placeholder="Search ID, title, locality..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadAllAdminData(localStorage.getItem('token'))}
                  style={{ width: '220px' }}
                />
                <select
                  className="form-select form-select-sm rounded-pill"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ width: '150px' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5 text-muted">
                  <i className="fa-solid fa-spinner fa-spin fs-4 mb-2"></i>
                  <p className="mb-0 small">Fetching complaints...</p>
                </div>
              ) : complaints.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fa-regular fa-folder-open fs-1 text-muted mb-2 d-block"></i>
                  <p className="text-secondary small">No complaints found for current filter.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-xs text-uppercase font-monospace">
                      <tr>
                        <th className="ps-4">ID</th>
                        <th>Category</th>
                        <th>Title & Citizen</th>
                        <th>Location</th>
                        <th>Assigned Staff</th>
                        <th>Status</th>
                        <th className="text-end pe-4">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.map((comp) => (
                        <tr key={comp._id}>
                          <td className="ps-4 fw-bold font-monospace text-teal-800" style={{ color: '#0f766e' }}>
                            {comp.complaint_id}
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">{comp.category}</span>
                          </td>
                          <td>
                            <div className="fw-semibold small text-truncate" style={{ maxWidth: '200px' }}>{comp.title}</div>
                            <small className="text-muted text-truncate d-block" style={{ maxWidth: '200px' }}>
                              <i className="fa-solid fa-user text-xs me-1"></i>{comp.user_id?.name || 'Citizen'} ({comp.user_id?.phone || 'No phone'})
                            </small>
                          </td>
                          <td>
                            <div className="small text-truncate" style={{ maxWidth: '160px' }}>{comp.location}</div>
                          </td>
                          <td>
                            {comp.assigned_staff_id ? (
                              <span className="badge bg-info-subtle text-info-emphasis rounded-pill px-2.5 py-1">
                                <i className="fa-solid fa-user-check me-1"></i>{comp.assigned_staff_id.name}
                              </span>
                            ) : (
                              <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2.5 py-1">
                                Unassigned
                              </span>
                            )}
                          </td>
                          <td>
                            <StatusBadge status={comp.status} />
                          </td>
                          <td className="text-end pe-4">
                            <div className="d-flex justify-content-end gap-1">
                              <button
                                className="btn btn-outline-primary btn-sm rounded-pill px-2.5"
                                title="Assign to Field Staff"
                                onClick={() => {
                                  setAssignModalData(comp);
                                  setSelectedStaffId(staffList[0]?._id || '');
                                }}
                              >
                                <i className="fa-solid fa-user-plus me-1"></i> Assign
                              </button>
                              <button
                                className="btn btn-outline-success btn-sm rounded-pill px-2.5"
                                title="Change Status"
                                onClick={() => {
                                  setStatusModalData(comp);
                                  setNewStatus(comp.status);
                                  setRemarks('');
                                }}
                              >
                                <i className="fa-solid fa-sliders me-1"></i> Status
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm rounded-pill px-2"
                                title="Delete Complaint"
                                onClick={() => handleDeleteComplaint(comp._id, comp.complaint_id)}
                              >
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: OVERVIEW & CHARTS */}
        {activeTab === 'overview' && (
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                <h5 className="fw-bold text-dark mb-1">Complaints by Problem Category</h5>
                <p className="text-secondary small mb-3">Breakdown across Street Light, Water, Drainage, and Cleaning</p>
                <div style={{ height: '280px', position: 'relative' }}>
                  <canvas ref={chartCategoryRef}></canvas>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                <h5 className="fw-bold text-dark mb-1">Complaints by Resolution Status</h5>
                <p className="text-secondary small mb-3">Submitted vs In Progress vs Resolved counts</p>
                <div style={{ height: '280px', position: 'relative' }}>
                  <canvas ref={chartStatusRef}></canvas>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STAFF DIRECTORY */}
        {activeTab === 'staff' && (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div className="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center border-bottom">
              <h5 className="fw-bold text-dark mb-0">Registered Field Staff Directory</h5>
              <button className="btn btn-teal text-white btn-sm rounded-pill px-3" style={{ backgroundColor: '#0f766e' }} onClick={() => setCreateStaffOpen(true)}>
                <i className="fa-solid fa-plus me-1"></i> Add New Staff
              </button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-xs text-uppercase font-monospace">
                    <tr>
                      <th className="ps-4">Staff Member</th>
                      <th>Department</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Enrolled On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map((s) => (
                      <tr key={s._id}>
                        <td className="ps-4 fw-bold">{s.name}</td>
                        <td><span className="badge bg-secondary-subtle text-secondary-emphasis">{s.department || 'Field Services'}</span></td>
                        <td>{s.email}</td>
                        <td>{s.phone || 'N/A'}</td>
                        <td className="text-muted small">{new Date(s.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CITIZEN REGISTRY */}
        {activeTab === 'users' && (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div className="card-header bg-white py-3 px-4 border-bottom">
              <h5 className="fw-bold text-dark mb-0">Citizen Directory</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-xs text-uppercase font-monospace">
                    <tr>
                      <th className="ps-4">Citizen Name</th>
                      <th>Email (Gmail Alerts)</th>
                      <th>Phone (SMS Alerts)</th>
                      <th>Address / Ward</th>
                      <th>Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.filter(u => u.role === 'citizen').map((u) => (
                      <tr key={u._id}>
                        <td className="ps-4 fw-bold">{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.phone || 'N/A'}</td>
                        <td className="small">{u.address || 'N/A'}</td>
                        <td className="text-muted small">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SMS & EMAIL AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="fa-solid fa-envelope text-primary fs-5"></i>
                  <h5 className="fw-bold mb-0">Gmail / Email Dispatch Logs</h5>
                </div>
                <div className="bg-dark text-light p-3 rounded-3 font-monospace small overflow-y-auto" style={{ maxHeight: '350px', fontSize: '11px' }}>
                  {notificationLogs.emailLogs && notificationLogs.emailLogs.length > 0 ? (
                    notificationLogs.emailLogs.map((log, i) => (
                      <div key={i} className="mb-2 pb-1 border-bottom border-secondary">{log}</div>
                    ))
                  ) : (
                    <div className="text-muted">No email logs recorded yet.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="fa-solid fa-mobile-screen-button text-success fs-5"></i>
                  <h5 className="fw-bold mb-0">SMS Dispatch Logs</h5>
                </div>
                <div className="bg-dark text-light p-3 rounded-3 font-monospace small overflow-y-auto" style={{ maxHeight: '350px', fontSize: '11px' }}>
                  {notificationLogs.smsLogs && notificationLogs.smsLogs.length > 0 ? (
                    notificationLogs.smsLogs.map((log, i) => (
                      <div key={i} className="mb-2 pb-1 border-bottom border-secondary">{log}</div>
                    ))
                  ) : (
                    <div className="text-muted">No SMS logs recorded yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ASSIGN STAFF */}
      {assignModalData && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-teal-800 text-white rounded-top-4" style={{ backgroundColor: '#0f766e' }}>
                <h5 className="modal-title fw-bold">Assign Staff - {assignModalData.complaint_id}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setAssignModalData(null)}></button>
              </div>
              <form onSubmit={handleAssignStaff}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Issue Summary</label>
                    <div className="p-2 bg-light rounded border small">{assignModalData.title} ({assignModalData.category})</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Select Field Staff Member *</label>
                    <select
                      className="form-select"
                      value={selectedStaffId}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      required
                    >
                      {staffList.map((st) => (
                        <option key={st._id} value={st._id}>
                          {st.name} — {st.department || 'Civic Services'} ({st.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="alert alert-info py-2 px-3 rounded-3 text-xs mb-0 d-flex align-items-center gap-2">
                    <i className="fa-solid fa-bell text-primary"></i>
                    <div>Citizen will instantly receive an In-App alert, Gmail update, and SMS message with staff details.</div>
                  </div>
                </div>
                <div className="modal-footer bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-secondary rounded-pill px-3" onClick={() => setAssignModalData(null)}>Cancel</button>
                  <button type="submit" className="btn btn-teal text-white rounded-pill px-4 fw-bold" style={{ backgroundColor: '#0f766e' }} disabled={actionLoading}>
                    {actionLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Assign & Notify Citizen'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE STATUS */}
      {statusModalData && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-dark text-white rounded-top-4">
                <h5 className="modal-title fw-bold">Admin Status Update - {statusModalData.complaint_id}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setStatusModalData(null)}></button>
              </div>
              <form onSubmit={handleUpdateStatus}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold small">New Status *</label>
                    <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} required>
                      <option value="Submitted">Submitted</option>
                      <option value="Pending">Pending</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Administrative Remarks</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="e.g. Work inspected and verified by chief municipal engineer."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="alert alert-info py-2 px-3 rounded-3 text-xs mb-0 d-flex align-items-center gap-2">
                    <i className="fa-solid fa-bell text-primary"></i>
                    <div>Citizen will be alerted immediately across all registered channels.</div>
                  </div>
                </div>
                <div className="modal-footer bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-secondary rounded-pill px-3" onClick={() => setStatusModalData(null)}>Cancel</button>
                  <button type="submit" className="btn btn-dark rounded-pill px-4 fw-bold" disabled={actionLoading}>
                    {actionLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Update & Notify'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE STAFF */}
      {createStaffOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-teal-800 text-white rounded-top-4" style={{ backgroundColor: '#0f766e' }}>
                <h5 className="modal-title fw-bold">Enroll New Field Staff Member</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setCreateStaffOpen(false)}></button>
              </div>
              <form onSubmit={handleCreateStaff}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Staff Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Manoj Sharma"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Staff Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="manoj@example.com"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Department *</label>
                    <select
                      className="form-select"
                      value={newStaff.department}
                      onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                    >
                      <option value="Street Lighting">Street Lighting</option>
                      <option value="Water Supply">Water Supply</option>
                      <option value="Drainage & Sewerage">Drainage & Sewerage</option>
                      <option value="Sanitation & Cleaning">Sanitation & Cleaning</option>
                      <option value="General Civic Services">General Civic Services</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Phone / Mobile</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="e.g. 9876543210"
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Min 6 characters"
                      value={newStaff.password}
                      onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-secondary rounded-pill px-3" onClick={() => setCreateStaffOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-teal text-white rounded-pill px-4 fw-bold" style={{ backgroundColor: '#0f766e' }} disabled={actionLoading}>
                    {actionLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AdminDashboard />);