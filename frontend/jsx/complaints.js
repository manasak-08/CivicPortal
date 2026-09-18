/**
 * My Complaints Component (React JSX)
 * Search, filter by category/status, view details, and track
 */
function MyComplaintsPage() {
  const [complaints, setComplaints] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [selectedComplaint, setSelectedComplaint] = React.useState(null);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login.html';
      return;
    }
    fetchComplaints();
  }, [categoryFilter, statusFilter]);

  const fetchComplaints = async () => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      let url = `/api/complaints?category=${categoryFilter}&status=${statusFilter}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data.complaints || []);
      }
    } catch (e) {
      console.error('Error fetching complaints:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar activePage="my-complaints" />

      <div className="container py-4 flex-grow-1">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
          <div>
            <h3 className="fw-bold text-dark mb-1">My Registered Complaints</h3>
            <p className="text-secondary small mb-0">
              Browse your complaint history, filter by status, and track field resolution
            </p>
          </div>
          <a href="/complaint.html" className="btn btn-teal text-white rounded-pill px-4 fw-semibold" style={{ backgroundColor: '#0f766e' }}>
            <i className="fa-solid fa-plus-circle me-1"></i> New Complaint
          </a>
        </div>

        {/* Search & Filters Card */}
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
          <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
            <div className="col-lg-5 col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by ID, title, or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-lg-3 col-md-4">
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Street Light">Street Light</option>
                <option value="Water Pipe Leakage">Water Pipe Leakage</option>
                <option value="Rain Water Drainage">Rain Water Drainage</option>
                <option value="Roadside Cleaning">Roadside Cleaning</option>
              </select>
            </div>

            <div className="col-lg-2 col-md-4">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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

            <div className="col-lg-2 col-md-12 d-flex gap-2">
              <button type="submit" className="btn btn-teal text-white w-100 rounded-3" style={{ backgroundColor: '#0f766e' }}>
                Search
              </button>
              {(search || categoryFilter !== 'all' || statusFilter !== 'all') && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setSearch('');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                  }}
                  title="Reset filters"
                >
                  <i className="fa-solid fa-rotate-left"></i>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Complaints Table Card */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5 text-muted">
                <i className="fa-solid fa-spinner fa-spin fs-4 mb-2"></i>
                <p className="mb-0 small">Loading complaints...</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-5">
                <i className="fa-regular fa-folder-open fs-1 text-muted mb-3 d-block"></i>
                <h6 className="fw-bold">No Complaints Found</h6>
                <p className="text-secondary small mb-3">Try adjusting your search criteria or register a new complaint.</p>
                <a href="/complaint.html" className="btn btn-teal text-white btn-sm rounded-pill px-3" style={{ backgroundColor: '#0f766e' }}>
                  Register Complaint
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
                      <th>Location</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((comp) => (
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
                          <div className="fw-semibold text-truncate" style={{ maxWidth: '200px' }}>{comp.title}</div>
                        </td>
                        <td>
                          <div className="text-secondary small text-truncate" style={{ maxWidth: '180px' }}>
                            <i className="fa-solid fa-location-dot me-1 text-danger opacity-75"></i>
                            {comp.location}
                          </div>
                        </td>
                        <td className="text-muted small">
                          {new Date(comp.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <StatusBadge status={comp.status} />
                        </td>
                        <td className="text-end pe-4">
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              className="btn btn-outline-teal btn-sm rounded-pill px-3"
                              style={{ borderColor: '#0f766e', color: '#0f766e' }}
                              onClick={() => setSelectedComplaint(comp)}
                            >
                              <i className="fa-solid fa-eye me-1"></i> Details
                            </button>
                            <a
                              href={`/track-complaint.html?id=${comp.complaint_id}`}
                              className="btn btn-light btn-sm rounded-pill px-3 border"
                            >
                              <i className="fa-solid fa-clock-rotate-left me-1"></i> Track
                            </a>
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
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-teal-700 text-white rounded-top-4" style={{ backgroundColor: '#0f766e' }}>
                <h5 className="modal-title fw-bold">
                  {selectedComplaint.complaint_id} - Full Details
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
                    <small className="text-muted d-block">Assigned Field Staff:</small>
                    <span>{selectedComplaint.assigned_staff_id ? selectedComplaint.assigned_staff_id.name : 'Pending Assignment'}</span>
                  </div>
                </div>

                {selectedComplaint.image && (
                  <div className="mb-4">
                    <small className="text-muted d-block mb-2 fw-bold">Attached Problem Photo:</small>
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
                    <i className="fa-solid fa-route me-1"></i> Track Status & Remarks
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

ReactDOM.createRoot(document.getElementById('root')).render(<MyComplaintsPage />);