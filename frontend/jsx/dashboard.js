/**
 * Citizen Dashboard Component (React JSX)
 * Displays metrics, notification alerts from staff/admin, recent complaints, and quick actions
 */
function CitizenDashboard() {
  const [user, setUser] = React.useState(null);
  const [counts, setCounts] = React.useState({ total: 0, pending: 0, in_progress: 0, resolved: 0, closed: 0 });
  const [complaints, setComplaints] = React.useState([]);
  const [recentNotifications, setRecentNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedComplaint, setSelectedComplaint] = React.useState(null);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      window.location.href = '/login.html';
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.role !== 'citizen') {
        window.location.href = '/login.html';
        return;
      }
      setUser(parsed);
      loadDashboardData(token);
    } catch (e) {
      window.location.href = '/login.html';
    }
  }, []);

  const loadDashboardData = async (token) => {
    try {
      setLoading(true);
      // Fetch complaints
      const compRes = await fetch('/api/complaints', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const compData = await compRes.json();
      if (compData.success) {
        setComplaints(compData.data.complaints || []);
        if (compData.data.counts) {
          setCounts(compData.data.counts);
        }
      }

      // Fetch notifications
      const notifRes = await fetch('/api/notifications?limit=3', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const notifData = await notifRes.json();
      if (notifData.success) {
        setRecentNotifications(notifData.data.notifications || []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar activePage="dashboard" />

      <div className="container py-4 flex-grow-1">
        {/* Welcome Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
          <div>
            <h3 className="fw-bold text-dark mb-1">
              Welcome back, {user ? user.name : 'Citizen'}! 👋
            </h3>
            <p className="text-secondary small mb-0">
              Civic Dashboard • Track and manage your registered complaints & municipal responses
            </p>
          </div>
          <div className="d-flex gap-2">
            <a href="/complaint.html" className="btn btn-teal text-white fw-semibold rounded-pill px-3 shadow-sm" style={{ backgroundColor: '#0f766e' }}>
              <i className="fa-solid fa-plus-circle me-1"></i> Register Complaint
            </a>
            <a href="/my-complaints.html" className="btn btn-outline-secondary rounded-pill px-3">
              <i className="fa-solid fa-list-check me-1"></i> View All
            </a>
          </div>
        </div>

        {/* Live Notification Banner from Staff/Admin */}
        {recentNotifications.length > 0 && !recentNotifications[0].is_read && (
          <div className="alert alert-info border-0 shadow-sm rounded-4 d-flex align-items-center justify-content-between p-3 mb-4 bg-teal-50 border-start border-4 border-teal-600" style={{ backgroundColor: '#f0fdfa' }}>
            <div className="d-flex align-items-center gap-3">
              <span className="badge bg-teal-700 p-2 rounded-circle text-white" style={{ backgroundColor: '#0f766e' }}>
                <i className="fa-solid fa-bell fs-6"></i>
              </span>
              <div>
                <strong className="text-teal-900 d-block">{recentNotifications[0].title}</strong>
                <span className="text-secondary small">{recentNotifications[0].message}</span>
              </div>
            </div>
            <a
              href={`/track-complaint.html?id=${recentNotifications[0].complaint_code}`}
              className="btn btn-sm btn-outline-teal rounded-pill px-3 fw-semibold text-nowrap ms-2"
              style={{ borderColor: '#0f766e', color: '#0f766e' }}
            >
              Track Update &rarr;
            </a>
          </div>
        )}

        {/* 5 Metric Cards */}
        <div className="row g-3 mb-4">
          <div className="col-lg col-md-4 col-sm-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-primary">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-semibold text-uppercase">Total</div>
                  <div className="fs-3 fw-bold text-dark">{counts.total || 0}</div>
                </div>
                <div className="rounded-3 bg-primary bg-opacity-10 text-primary p-2">
                  <i className="fa-solid fa-folder-open fs-4"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg col-md-4 col-sm-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-warning">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-semibold text-uppercase">Pending</div>
                  <div className="fs-3 fw-bold text-warning">{counts.pending || 0}</div>
                </div>
                <div className="rounded-3 bg-warning bg-opacity-10 text-warning p-2">
                  <i className="fa-solid fa-hourglass-half fs-4"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg col-md-4 col-sm-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-info">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-semibold text-uppercase">In Progress</div>
                  <div className="fs-3 fw-bold text-info">{counts.in_progress || 0}</div>
                </div>
                <div className="rounded-3 bg-info bg-opacity-10 text-info p-2">
                  <i className="fa-solid fa-person-digging fs-4"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg col-md-4 col-sm-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-success">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-semibold text-uppercase">Resolved</div>
                  <div className="fs-3 fw-bold text-success">{counts.resolved || 0}</div>
                </div>
                <div className="rounded-3 bg-success bg-opacity-10 text-success p-2">
                  <i className="fa-solid fa-check-double fs-4"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg col-md-4 col-sm-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-secondary">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-semibold text-uppercase">Closed</div>
                  <div className="fs-3 fw-bold text-secondary">{counts.closed || 0}</div>
                </div>
                <div className="rounded-3 bg-secondary bg-opacity-10 text-secondary p-2">
                  <i className="fa-solid fa-box-archive fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Complaints Table */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <div className="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center border-bottom">
            <h5 className="fw-bold text-dark mb-0">Recent Complaints</h5>
            <a href="/my-complaints.html" className="text-teal-700 fw-semibold text-decoration-none small" style={{ color: '#0f766e' }}>
              View Complete List ({complaints.length}) &rarr;
            </a>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5 text-muted">
                <i className="fa-solid fa-spinner fa-spin fs-4 mb-2"></i>
                <p className="mb-0 small">Fetching complaints...</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-5">
                <i className="fa-regular fa-folder-open fs-1 text-muted mb-3 d-block"></i>
                <h6 className="fw-bold">No Complaints Registered Yet</h6>
                <p className="text-secondary small mb-3">Notice an issue in your locality? Report it now.</p>
                <a href="/complaint.html" className="btn btn-teal text-white btn-sm rounded-pill px-3" style={{ backgroundColor: '#0f766e' }}>
                  Register First Complaint
                </a>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-xs text-uppercase font-monospace">
                    <tr>
                      <th className="ps-4">Complaint ID</th>
                      <th>Category</th>
                      <th>Title</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.slice(0, 5).map((comp) => (
                      <tr key={comp._id}>
                        <td className="ps-4 fw-bold font-monospace text-teal-800" style={{ color: '#0f766e' }}>
                          {comp.complaint_id}
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {comp.category}
                          </span>
                        </td>
                        <td>
                          <div className="fw-semibold text-truncate" style={{ maxWidth: '240px' }}>{comp.title}</div>
                          <small className="text-muted text-truncate d-block" style={{ maxWidth: '240px' }}>{comp.location}</small>
                        </td>
                        <td className="text-muted small">
                          {new Date(comp.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <StatusBadge status={comp.status} />
                        </td>
                        <td className="text-end pe-4">
                          <button
                            className="btn btn-outline-teal btn-sm rounded-pill px-3"
                            style={{ borderColor: '#0f766e', color: '#0f766e' }}
                            onClick={() => setSelectedComplaint(comp)}
                          >
                            <i className="fa-solid fa-eye me-1"></i> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-teal-700 text-white rounded-top-4" style={{ backgroundColor: '#0f766e' }}>
                <h5 className="modal-title fw-bold">
                  Complaint Details - {selectedComplaint.complaint_id}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedComplaint(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="badge bg-secondary-subtle text-secondary-emphasis fs-6 px-3 py-1 rounded-pill">
                    {selectedComplaint.category}
                  </span>
                  <StatusBadge status={selectedComplaint.status} />
                </div>

                <h4 className="fw-bold mb-2">{selectedComplaint.title}</h4>
                <p className="text-secondary mb-4">{selectedComplaint.description}</p>

                <div className="row g-3 mb-4 bg-light p-3 rounded-3 border">
                  <div className="col-sm-6">
                    <small className="text-muted d-block">Location:</small>
                    <strong>{selectedComplaint.location}</strong>
                  </div>
                  <div className="col-sm-6">
                    <small className="text-muted d-block">Landmark:</small>
                    <strong>{selectedComplaint.landmark || 'N/A'}</strong>
                  </div>
                  <div className="col-sm-6">
                    <small className="text-muted d-block">Registered On:</small>
                    <span>{new Date(selectedComplaint.created_at).toLocaleString()}</span>
                  </div>
                  <div className="col-sm-6">
                    <small className="text-muted d-block">Assigned Staff:</small>
                    <span>{selectedComplaint.assigned_staff_id ? selectedComplaint.assigned_staff_id.name : 'Unassigned'}</span>
                  </div>
                </div>

                {selectedComplaint.image && (
                  <div className="mb-4">
                    <small className="text-muted d-block mb-2 fw-bold">Attached Evidence Photo:</small>
                    <img
                      src={selectedComplaint.image}
                      alt="Complaint attachment"
                      className="img-fluid rounded-3 border shadow-sm"
                      style={{ maxHeight: '250px' }}
                    />
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                  <a
                    href={`/track-complaint.html?id=${selectedComplaint.complaint_id}`}
                    className="btn btn-teal text-white rounded-pill px-4"
                    style={{ backgroundColor: '#0f766e' }}
                  >
                    <i className="fa-solid fa-clock-rotate-left me-1"></i> View Full Timeline
                  </a>
                  <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setSelectedComplaint(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CitizenDashboard />);