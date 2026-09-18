/**
 * Complaint Registration Component (React JSX)
 * Form with Category selector, Location, Landmark, and Image upload preview
 */
function ComplaintRegistrationPage() {
  const [formData, setFormData] = React.useState({
    category: 'Street Light',
    title: '',
    description: '',
    location: '',
    landmark: ''
  });
  const [imageFile, setImageFile] = React.useState(null);
  const [imagePreview, setImagePreview] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [submittedComplaint, setSubmittedComplaint] = React.useState(null);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      window.location.href = '/login.html';
      return;
    }

    // Check query params for pre-selected category
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) {
      setFormData(prev => ({ ...prev, category: cat }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { category, title, description, location, landmark } = formData;
    if (!category || !title || !description || !location) {
      setError('Please fill in all required fields.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login.html';
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('category', category);
      data.append('title', title);
      data.append('description', description);
      data.append('location', location);
      data.append('landmark', landmark || '');
      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: data
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to submit complaint.');
      }

      setSubmittedComplaint(resData.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar activePage="complaint" />

      <div className="container py-5 flex-grow-1">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {submittedComplaint ? (
              /* Success Screen */
              <div className="card shadow-lg border-0 rounded-4 p-5 text-center bg-white">
                <div className="rounded-circle bg-success bg-opacity-10 text-success d-inline-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                  <i className="fa-solid fa-circle-check fs-1"></i>
                </div>
                <h3 className="fw-bold text-dark mb-2">Complaint registered successfully!</h3>
                <p className="text-secondary mb-4">
                  Your civic issue has been recorded in the municipal registry and queued for administrative review.
                </p>

                <div className="bg-teal-50 border border-teal-200 rounded-4 p-4 max-w-md mx-auto mb-4" style={{ backgroundColor: '#f0fdfa', borderColor: '#99f6e4' }}>
                  <small className="text-muted text-uppercase fw-bold font-monospace d-block mb-1">Generated Complaint ID</small>
                  <div className="fs-2 fw-bold text-teal-900 font-monospace" style={{ color: '#0f766e' }}>
                    {submittedComplaint.complaint_id}
                  </div>
                  <div className="badge bg-primary mt-2">Status: Submitted</div>
                </div>

                <div className="d-flex justify-content-center gap-3">
                  <a
                    href={`/track-complaint.html?id=${submittedComplaint.complaint_id}`}
                    className="btn btn-teal text-white fw-bold px-4 py-2.5 rounded-pill"
                    style={{ backgroundColor: '#0f766e' }}
                  >
                    <i className="fa-solid fa-magnifying-glass me-2"></i> Track Live Status
                  </a>
                  <a href="/dashboard.html" className="btn btn-outline-secondary px-4 py-2.5 rounded-pill">
                    <i className="fa-solid fa-gauge me-2"></i> Go to Dashboard
                  </a>
                </div>
              </div>
            ) : (
              /* Registration Form */
              <div className="card shadow-lg border-0 rounded-4 overflow-hidden bg-white">
                <div className="bg-teal-700 text-white p-4" style={{ backgroundColor: '#0f766e' }}>
                  <div className="d-flex align-items-center gap-2">
                    <i className="fa-solid fa-pen-to-square fs-4"></i>
                    <h3 className="fw-bold mb-0">Register Civic Complaint</h3>
                  </div>
                  <p className="small mb-0 opacity-90 mt-1">
                    Provide accurate location details and upload photos to help field officers inspect and resolve promptly.
                  </p>
                </div>

                <div className="card-body p-4 p-md-5">
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 mb-4" role="alert">
                      <i className="fa-solid fa-circle-exclamation text-danger fs-5"></i>
                      <div className="small">{error}</div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="form-label fw-bold text-dark">1. Complaint Category *</label>
                      <div className="row g-2">
                        {[
                          { val: 'Street Light', icon: 'fa-lightbulb', color: '#eab308' },
                          { val: 'Water Pipe Leakage', icon: 'fa-faucet-drip', color: '#0284c7' },
                          { val: 'Rain Water Drainage', icon: 'fa-cloud-showers-water', color: '#0d9488' },
                          { val: 'Roadside Cleaning', icon: 'fa-broom', color: '#ca8a04' }
                        ].map((cat) => (
                          <div key={cat.val} className="col-sm-6">
                            <label
                              className={`card p-3 rounded-3 border-2 text-center h-100 cursor-pointer transition-all ${
                                formData.category === cat.val
                                  ? 'border-teal-600 bg-teal-50 shadow-sm'
                                  : 'border-light-subtle bg-light hover-bg-white'
                              }`}
                              style={{
                                cursor: 'pointer',
                                borderColor: formData.category === cat.val ? '#0f766e' : '#e2e8f0',
                                backgroundColor: formData.category === cat.val ? '#f0fdfa' : '#f8fafc'
                              }}
                            >
                              <input
                                type="radio"
                                name="category"
                                value={cat.val}
                                checked={formData.category === cat.val}
                                onChange={handleChange}
                                className="d-none"
                              />
                              <i className={`fa-solid ${cat.icon} fs-4 mb-2`} style={{ color: cat.color }}></i>
                              <div className="fw-semibold small">{cat.val}</div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold text-dark small">2. Complaint Title *</label>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        placeholder="Brief summary of the issue (e.g. Broken LED fixture on 4th Main)"
                        value={formData.title}
                        onChange={handleChange}
                        maxLength="120"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold text-dark small">3. Detailed Description *</label>
                      <textarea
                        name="description"
                        rows="3"
                        className="form-control"
                        placeholder="Describe the severity, when it started, and any hazards to traffic/pedestrians..."
                        value={formData.description}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-md-7">
                        <label className="form-label fw-bold text-dark small">4. Location / Street Address *</label>
                        <input
                          type="text"
                          name="location"
                          className="form-control"
                          placeholder="Street, cross road, ward number..."
                          value={formData.location}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-5">
                        <label className="form-label fw-bold text-dark small">5. Landmark (Optional)</label>
                        <input
                          type="text"
                          name="landmark"
                          className="form-control"
                          placeholder="e.g. Near City Bank ATM"
                          value={formData.landmark}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-bold text-dark small">6. Upload Problem Photo (Optional)</label>
                      <div className="border border-2 border-dashed rounded-4 p-4 text-center bg-light">
                        {imagePreview ? (
                          <div className="position-relative d-inline-block">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="rounded-3 shadow-sm border"
                              style={{ maxHeight: '180px' }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle"
                              onClick={() => { setImageFile(null); setImagePreview(null); }}
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                        ) : (
                          <div>
                            <i className="fa-solid fa-cloud-arrow-up fs-2 text-muted mb-2"></i>
                            <p className="text-secondary small mb-2">Click below to upload JPG, PNG, or WEBP (Max 5MB)</p>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/jpg"
                              onChange={handleImageChange}
                              className="form-control form-control-sm mx-auto"
                              style={{ maxWidth: '300px' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-teal w-100 text-white fw-bold py-3 rounded-3 shadow-sm"
                      style={{ backgroundColor: '#0f766e' }}
                      disabled={loading}
                    >
                      {loading ? (
                        <span><i className="fa-solid fa-spinner fa-spin me-2"></i> Registering Complaint...</span>
                      ) : (
                        <span><i className="fa-solid fa-paper-plane me-2"></i> Submit Complaint</span>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ComplaintRegistrationPage />);