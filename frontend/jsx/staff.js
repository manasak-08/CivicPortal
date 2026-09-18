/**
 * Staff Dashboard Component (React JSX)
 * View assigned tasks, update status, add field remarks, and trigger citizen alerts
 */
function StaffDashboard() {
  const [user, setUser] = React.useState(null);
  const [complaints, setComplaints] = React.useState([]);
  const [counts, setCounts] = React.useState({ total: 0, assigned: 0, in_progress: 0, resolved: 0 });
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [updatingComplaint, setUpdatingComplaint] = React.useState(null);
  const [newStatus, setNewStatus] = React.useState('In Progress');
  const [remarks, setRemarks] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState('');

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      window.location.href = '/staff-login.html';
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.role !== 'staff') {
        window.location.href = '/staff-login.html';
        return;
      }
      setUser(parsed);
      loadAssignedComplaints(token);
    } catch (e) {
      window.location.href = '/staff-login.html';
    }
  }, [statusFilter]);

  const loadAssignedComplaints = async (token) => {
    try {
      setLoading(true);
      let url = `/api/staff/complaints?status=${statusFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data.complaints || []);
        if (data.data.counts) {
          setCounts(data.data.counts);
        }
      }
    } catch (e) {
      console.error('Error fetching staff tasks:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!updatingComplaint) return;

    const token = localStorage.getItem('token');
    try {
      setActionLoading(true);
      const res = await fetch(`/api/staff/complaints/${updatingComplaint._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          remarks: remarks || `Status updated to ${newStatus} by field officer.`
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update status.');
      }

      setAlertMsg(`Status of ${updatingComplaint.complaint_id} updated to "${newStatus}". Citizen notified via In-App, Gmail & SMS.`);
      setUpdatingComplaint(null);
      setRemarks('');
      loadAssignedComplaints(token);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar activePage="staff" />

      <div className="container py-4 flex-grow-1">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-warning text-dark font-monospace text-xs">FIELD OPERATIONS</span>
              <span className="badge bg-primary text-white text-xs">{user?.department || 'Civic Services'}</span>
            </div>
            <h3 className="fw-bold text-dark mb-0 mt-1">
              Field Staff Task Dashboard
            </h3>
            <p className="text-secondary small mb-0">
              Officer: <strong>{user?.name}</strong> • Update task progress and post inspection remarks
            </p>
          </div>
          <button
            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
            onClick={() => loadAssignedComplaints(localStorage.getItem('token'))}
          >
            <i className="fa-solid fa-arrows-rotate me-1"></i> Refresh Tasks
          </button>
        </div>

        {alertMsg && (
          <div className="alert alert-success alert-dismissible fade show rounded-4 shadow-sm border-0 d-flex align-items-center gap-2 p-3 mb-4">
            <i className="fa-solid fa-circle-check fs-5 text-success"></i>
            <div>{alertMsg}</div>
            <button type="button" className="btn-close ms-auto" onClick={() => setAlertMsg('')}></button>
          </div>
        )}

        {/* Status Metrics */}
        <div className="row g-3 mb-4">
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-primary">
              <small className="text-muted text-uppercase fw-bold text-xs">Total Assigned</small>
              <div className="fs-3 fw-bold text-dark">{counts.total || 0}</div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-warning">
              <small className="text-muted text-uppercase fw-bold text-xs">Pending Inspection</small>
              <div className="fs-3 fw-bold text-warning">{counts.assigned || 0}</div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-info">
              <small className="text-muted text-uppercase fw-bold text-xs">In Progress</small>
              <div className="fs-3 fw-bold text-info">{counts.in_progress || 0}</div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-success">
              <small className="text-muted text-uppercase fw-bold text-xs">Resolved</small>
              <div className="fs-3 fw-bold text-success">{counts.resolved || 0}</div>
            </div>
          </div>
        </div>

        {/* Task List Card */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="card-header bg-white py-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 border-bottom">
            <h5 className="fw-bold text-dark mb-0">Assigned Complaints List</h5>
            <div className="d-flex gap-2">
              <select
                className="form-select form-select-sm rounded-pill"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: '160px' }}
              >
                <option value="all">All Statuses</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5 text-muted">
                <i className="fa-solid fa-spinner fa-spin fs-4 mb-2"></i>
                <p className="mb-0 small">Loading assigned tasks...</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-5">
                <i className="fa-solid fa-clipboard-check fs-1 text-muted mb-3 d-block"></i>
                <h6 className="fw-bold">No Tasks Pending</h6>
                <p className="text-secondary small mb-0">You have no complaints assigned matching the current filter.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-xs text-uppercase font-monospace">
                    <tr>
                      <th className="ps-4">ID</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Issue Details</th>
                      <th>Current Status</th>
                      <th className="text-end pe-4">Field Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((comp) => (
                      <tr key={comp._id}>
                        <td className="ps-4 fw-bold font-monospace text-primary">
                          {comp.complaint_id}
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {comp.category}
                          </span>
                        </td>
                        <td>
                          <div className="fw-semibold small text-truncate" style={{ maxWidth: '180px' }}>{comp.location}</div>
                          <small className="text-muted text-truncate d-block" style={{ maxWidth: '180px' }}>{comp.landmark || 'No landmark'}</small>
                        </td>
                        <td>
                          <div className="fw-medium small text-truncate" style={{ maxWidth: '220px' }}>{comp.title}</div>
                          <small className="text-secondary text-truncate d-block" style={{ maxWidth: '220px' }}>{comp.description}</small>
                        </td>
                        <td>
                          <StatusBadge status={comp.status} />
                        </td>
                        <td className="text-end pe-4">
                          <button
                            className="btn btn-primary btn-sm rounded-pill px-3 fw-semibold shadow-xs"
                            style={{ backgroundColor: '#1d4ed8' }}
                            onClick={() => {
                              setUpdatingComplaint(comp);
                              setNewStatus(comp.status === 'Assigned' ? 'In Progress' : 'Resolved');
                              setRemarks('');
                            }}
                          >
                            <i className="fa-solid fa-pen-to-square me-1"></i> Update Status
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

      {/* Update Status Modal */}
      {updatingComplaint && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-primary text-white rounded-top-4" style={{ backgroundColor: '#1d4ed8' }}>
                <h5 className="modal-title fw-bold">
                  Update Task: {updatingComplaint.complaint_id}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setUpdatingComplaint(null)}></button>
              </div>

              <form onSubmit={handleUpdateStatus}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Complaint Title</label>
                    <div className="p-2 bg-light rounded border small">{updatingComplaint.title}</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small">Location</label>
                    <div className="p-2 bg-light rounded border small">{updatingComplaint.location}</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small">Select New Status *</label>
                    <select
                      className="form-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      required
                    >
                      <option value="In Progress">In Progress (Work Underway)</option>
                      <option value="Resolved">Resolved (Problem Solved)</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small">Field Remarks / Action Taken *</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="e.g. Inspected site at 10 AM, replaced faulty cable, lamp working normally."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      required
                    ></textarea>
                    <small className="text-muted text-xs">These remarks are sent to the citizen via In-App, Gmail, and SMS.</small>
                  </div>

                  <div className="alert alert-info py-2 px-3 rounded-3 text-xs mb-0 d-flex align-items-center gap-2">
                    <i className="fa-solid fa-bell text-primary"></i>
                    <div>Submitting will automatically notify the citizen of this status change.</div>
                  </div>
                </div>

                <div className="modal-footer bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-secondary rounded-pill px-3" onClick={() => setUpdatingComplaint(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold" style={{ backgroundColor: '#1d4ed8' }} disabled={actionLoading}>
                    {actionLoading ? <i className="fa-solid fa-spinner fa-spin me-1"></i> : <i className="fa-solid fa-check me-1"></i>} Save & Notify Citizen
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

ReactDOM.createRoot(document.getElementById('root')).render(<StaffDashboard />);