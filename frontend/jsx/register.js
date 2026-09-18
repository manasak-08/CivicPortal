/**
 * Register Component (React JSX)
 * Citizen registration form with full field validation
 */
function RegisterPage() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const name = (formData.name || '').trim();
    const email = (formData.email || '').trim().toLowerCase();
    const phone = (formData.phone || '').trim();
    const address = (formData.address || '').trim();
    const password = (formData.password || '').trim();
    const confirmPassword = (formData.confirmPassword || '').trim();

    if (!name || !email || !phone || !address || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-check both password fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          address,
          password,
          confirmPassword,
          role: 'citizen'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      // Automatically log the citizen in and redirect to dashboard
      if (data.data && data.data.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setSuccess('Registration successful! Logging you in to your dashboard...');
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 800);
      } else {
        setSuccess('Registration successful! Redirecting to dashboard...');
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 800);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar activePage="register" />

      <div className="container my-auto py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-9">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="bg-teal-700 text-white p-4 text-center" style={{ backgroundColor: '#0f766e' }}>
                <span className="badge bg-white text-teal-800 rounded-pill px-3 py-1 mb-2 font-monospace" style={{ color: '#0f766e' }}>
                  <i className="fa-solid fa-address-card me-1"></i> CITIZEN ENROLLMENT
                </span>
                <h3 className="fw-bold mb-1">Create Citizen Account</h3>
                <p className="small mb-0 opacity-90">Join the civic management portal to submit and track community complaints</p>
              </div>

              <div className="card-body p-4 p-md-5">
                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3" role="alert">
                    <i className="fa-solid fa-circle-exclamation text-danger fs-5"></i>
                    <div className="small">{error}</div>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 rounded-3" role="alert">
                    <i className="fa-solid fa-circle-check text-success fs-5"></i>
                    <div className="small">{success}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-12">
                      <label className="form-label fw-semibold small">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="e.g. Priya Sharma"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="priya@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Phone / Mobile (for SMS) *</label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                      <small className="text-muted text-xs">Used for SMS status alerts.</small>
                    </div>

                    <div className="col-md-12">
                      <label className="form-label fw-semibold small">Residential Address / Ward *</label>
                      <textarea
                        name="address"
                        className="form-control"
                        rows="2"
                        placeholder="House No., Street, Ward, City"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Password *</label>
                      <input
                        type="password"
                        name="password"
                        className="form-control"
                        placeholder="Min 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Confirm Password *</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        className="form-control"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-teal w-100 text-white fw-bold py-2.5 rounded-3 mt-4 mb-3"
                    style={{ backgroundColor: '#0f766e' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <span><i className="fa-solid fa-spinner fa-spin me-2"></i> Registering Account...</span>
                    ) : (
                      <span><i className="fa-solid fa-user-check me-2"></i> Complete Registration</span>
                    )}
                  </button>
                </form>

                <div className="text-center pt-3 border-top">
                  <p className="text-muted small mb-0">
                    Already have an account?{' '}
                    <a href="/login.html" className="fw-bold text-decoration-none" style={{ color: '#0f766e' }}>
                      Login here
                    </a>
                  </p>
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

ReactDOM.createRoot(document.getElementById('root')).render(<RegisterPage />);