/**
 * Staff Login Component (React JSX)
 * Dedicated Field Staff Authentication Portal
 */
function StaffLoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.role === 'staff') {
          window.location.href = '/staff.html';
        }
      } catch (e) {}
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Staff login failed.');
      }

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      window.location.href = '/staff.html';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (staffEmail) => {
    setEmail(staffEmail);
    setPassword('staff123');
    setError('');
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar activePage="staff" />

      <div className="container my-auto py-5">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="bg-primary text-white p-4 text-center" style={{ backgroundColor: '#1d4ed8' }}>
                <span className="badge bg-warning text-dark rounded-pill px-3 py-1 mb-2 font-monospace">
                  <i className="fa-solid fa-helmet-safety me-1"></i> FIELD SERVICES
                </span>
                <h3 className="fw-bold mb-1">Staff Member Portal</h3>
                <p className="small mb-0 opacity-90">Sign in to view assignments, update status, and resolve complaints</p>
              </div>

              <div className="card-body p-4 p-md-5">
                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3" role="alert">
                    <i className="fa-solid fa-circle-exclamation text-danger fs-5"></i>
                    <div className="small">{error}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Staff Email / Username</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light"><i className="fa-solid fa-id-badge text-muted"></i></span>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="staff@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold small">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light"><i className="fa-solid fa-key text-muted"></i></span>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 fw-bold py-2.5 rounded-3 mb-3"
                    style={{ backgroundColor: '#1d4ed8' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <span><i className="fa-solid fa-spinner fa-spin me-2"></i> Authenticating...</span>
                    ) : (
                      <span><i className="fa-solid fa-arrow-right-to-bracket me-2"></i> Access Staff Dashboard</span>
                    )}
                  </button>

                  {/* 1-Click Quick Fill Buttons for Staff */}
                  <div className="mb-4">
                    <small className="text-muted d-block mb-2 text-center text-xs font-monospace text-uppercase">
                      1-Click Test Staff Credentials:
                    </small>
                    <div className="d-flex flex-column gap-1.5">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm text-start py-1.5 px-3 rounded-3 font-monospace text-xs"
                        onClick={() => handleQuickFill('staff@example.com')}
                      >
                        ⚡ Rajesh Kumar (Lighting Dept) - staff@example.com
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm text-start py-1.5 px-3 rounded-3 font-monospace text-xs"
                        onClick={() => handleQuickFill('water_dept@example.com')}
                      >
                        ⚡ Amit Patel (Water Supply) - water_dept@example.com
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm text-start py-1.5 px-3 rounded-3 font-monospace text-xs"
                        onClick={() => handleQuickFill('clean_dept@example.com')}
                      >
                        ⚡ Sunita Verma (Sanitation) - clean_dept@example.com
                      </button>
                    </div>
                  </div>
                </form>

                <div className="text-center pt-3 border-top">
                  <div className="d-flex justify-content-center gap-3 text-xs">
                    <a href="/login.html" className="text-decoration-none text-secondary">
                      <i className="fa-solid fa-user me-1"></i> Citizen Login
                    </a>
                    <span className="text-muted">•</span>
                    <a href="/admin-login.html" className="text-decoration-none text-secondary">
                      <i className="fa-solid fa-shield-halved me-1 text-info"></i> Admin Login
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<StaffLoginPage />);