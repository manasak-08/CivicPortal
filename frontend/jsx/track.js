/**
 * Track Complaint Component (React JSX)
 * Public tracking with visual Timeline, updates history, and communication dispatch audit
 */
function TrackComplaintPage() {
  const [complaintId, setComplaintId] = React.useState('');
  const [complaintData, setComplaintData] = React.useState(null);
  const [updates, setUpdates] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setComplaintId(id.trim());
      fetchTracking(id.trim());
    }
  }, []);

  const fetchTracking = async (idToFetch) => {
    if (!idToFetch) return;
    try {
      setLoading(true);
      setError('');
      setComplaintData(null);

      const res = await fetch(`/api/complaints/track/${encodeURIComponent(idToFetch.toUpperCase())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Complaint "${idToFetch}" not found.`);
      }

      setComplaintData(data.data.complaint);
      setUpdates(data.data.updates || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!complaintId.trim()) {
      setError('Please enter a Complaint ID.');
      return;
    }
    fetchTracking(complaintId.trim());
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar activePage="track" />

      <div className="container py-5 flex-grow-1">
        {/* Search Banner */}
        <div className="text-center max-w-xl mx-auto mb-4">
          <span className="badge bg-teal-100 text-teal-800 rounded-pill px-3 py-1 font-monospace mb-2" style={{ backgroundColor: '#ccfbf1', color: '#0f766e' }}>
            <i className="fa-solid fa-tower-broadcast me-1"></i> PUBLIC CIVIC TRACKER
          </span>
          <h2 className="fw-bold text-dark">Track Civic Complaint</h2>
          <p className="text-secondary small">
            Check real-time inspection status, assigned maintenance officers, and field remarks anytime.
          </p>

          <form onSubmit={handleSearch} className="card shadow-sm border-0 rounded-pill p-2 bg-white mt-3">
            <div className="input-group">
              <span className="input-group-text bg-transparent border-0 ps-3">
                <i className="fa-solid fa-magnifying-glass text-teal-700" style={{ color: '#0f766e' }}></i>
              </span>
              <input
                type="text"
                className="form-control border-0 bg-transparent font-monospace"
                placeholder="Enter Complaint ID (e.g. CMP-2026-0001)"
                value={complaintId}
                onChange={(e) => setComplaintId(e.target.value)}
              />
              <button type="submit" className="btn btn-teal text-white rounded-pill px-4 fw-bold" style={{ backgroundColor: '#0f766e' }} disabled={loading}>
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Track Status'}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="alert alert-warning max-w-lg mx-auto shadow-sm rounded-4 text-center p-3 mb-4">
            <i className="fa-solid fa-triangle-exclamation text-warning fs-4 mb-2 d-block"></i>
            <strong>Complaint Not Found</strong>
            <p className="mb-0 small text-secondary mt-1">{error}</p>
          </div>
        )}

        {complaintData && (
          <div className="row justify-content-center">
            <div className="col-lg-9">
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white mb-4">
                {/* Header Badge */}
                <div className="bg-teal-700 text-white p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3" style={{ backgroundColor: '#0f766e' }}>
                  <div>
                    <span className="badge bg-white text-teal-900 rounded-pill px-3 py-1 font-monospace mb-2" style={{ color: '#0f766e' }}>
                      {complaintData.complaint_id}
                    </span>
                    <h3 className="fw-bold mb-0">{complaintData.title}</h3>
                  </div>
                  <StatusBadge status={complaintData.status} />
                </div>

                <div className="card-body p-4 p-md-5">
                  {/* Step-by-step Visual Timeline */}
                  <Timeline currentStatus={complaintData.status} updates={updates} />

                  {/* Complaint Details Grid */}
                  <div className="row g-4 mt-2">
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-4 border h-100">
                        <h6 className="fw-bold text-dark text-uppercase font-monospace text-xs mb-3 text-secondary">
                          <i className="fa-solid fa-circle-info me-1"></i> Issue Information
                        </h6>
                        <table className="table table-sm table-borderless small mb-0">
                          <tbody>
                            <tr>
                              <td className="text-muted" style={{ width: '120px' }}>Category:</td>
                              <td className="fw-semibold">{complaintData.category}</td>
                            </tr>
                            <tr>
                              <td className="text-muted">Description:</td>
                              <td>{complaintData.description}</td>
                            </tr>
                            <tr>
                              <td className="text-muted">Registered On:</td>
                              <td>{new Date(complaintData.created_at).toLocaleString()}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-4 border h-100">
                        <h6 className="fw-bold text-dark text-uppercase font-monospace text-xs mb-3 text-secondary">
                          <i className="fa-solid fa-location-dot me-1 text-danger"></i> Location & Assignment
                        </h6>
                        <table className="table table-sm table-borderless small mb-0">
                          <tbody>
                            <tr>
                              <td className="text-muted" style={{ width: '120px' }}>Location:</td>
                              <td className="fw-semibold">{complaintData.location}</td>
                            </tr>
                            <tr>
                              <td className="text-muted">Landmark:</td>
                              <td>{complaintData.landmark || 'None specified'}</td>
                            </tr>
                            <tr>
                              <td className="text-muted">Field Officer:</td>
                              <td className="fw-bold text-teal-800" style={{ color: '#0f766e' }}>
                                {complaintData.assigned_staff_id ? (
                                  <span>
                                    <i className="fa-solid fa-user-check me-1"></i>
                                    {complaintData.assigned_staff_id.name}
                                  </span>
                                ) : (
                                  <span className="badge bg-secondary-subtle text-secondary-emphasis">Pending Assignment</span>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Photo Evidence */}
                  {complaintData.image && (
                    <div className="mt-4 pt-3 border-top">
                      <h6 className="fw-bold text-secondary text-uppercase text-xs font-monospace mb-2">
                        <i className="fa-solid fa-camera me-1"></i> Problem Photo
                      </h6>
                      <img
                        src={complaintData.image}
                        alt="Complaint evidence"
                        className="img-fluid rounded-3 border shadow-xs"
                        style={{ maxHeight: '280px' }}
                      />
                    </div>
                  )}

                  {/* Communication Notice */}
                  <div className="alert alert-light border rounded-3 mt-4 mb-0 d-flex align-items-center gap-3 py-2 px-3 text-xs text-muted">
                    <i className="fa-solid fa-bell text-warning fs-5"></i>
                    <div>
                      <strong>Citizen Alerts Active:</strong> Notifications for status changes and remarks are automatically delivered via In-App notifications, registered Gmail, and SMS.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<TrackComplaintPage />);