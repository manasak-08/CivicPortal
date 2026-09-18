function AdminLogin() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError('Please enter email and password.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: password
        })
      });

      const result = await response.json();

      console.log('ADMIN LOGIN RESPONSE:', result);

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || 'Invalid admin email or password.'
        );
      }

      // Backend response is expected as:
      // result.data.token
      // result.data.user

      const loginData = result.data || result;

      const token = loginData.token;
      const user = loginData.user;

      if (!token) {
        throw new Error('Authentication token was not received.');
      }

      if (!user) {
        throw new Error('Admin user information was not received.');
      }

      if (user.role !== 'admin') {
        throw new Error('This account is not an administrator account.');
      }

      // Save authentication
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('ADMIN TOKEN SAVED:', !!localStorage.getItem('token'));
      console.log('ADMIN USER SAVED:', localStorage.getItem('user'));

      // Go to admin dashboard
      window.location.href = '/admin.html';

    } catch (err) {
      console.error('ADMIN LOGIN ERROR:', err);

      setError(
        err.message || 'Unable to login as administrator.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">

      <div className="container my-auto py-5">

        <div className="row justify-content-center">

          <div className="col-lg-5 col-md-8">

            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">

              <div
                className="text-white text-center p-4"
                style={{ backgroundColor: '#0f766e' }}
              >

                <i className="fa-solid fa-user-shield fa-2x mb-2"></i>

                <h3 className="fw-bold mb-1">
                  Admin Login
                </h3>

                <p className="small mb-0">
                  CivicPortal Administration
                </p>

              </div>

              <div className="card-body p-4 p-md-5">

                {error && (
                  <div className="alert alert-danger">
                    <i className="fa-solid fa-circle-exclamation me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Admin Email
                    </label>

                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter admin email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />

                  </div>

                  <div className="mb-4">

                    <label className="form-label fw-semibold">
                      Password
                    </label>

                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />

                  </div>

                  <button
                    type="submit"
                    className="btn w-100 text-white fw-bold py-2 rounded-3"
                    style={{ backgroundColor: '#0f766e' }}
                    disabled={loading}
                  >

                    {loading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin me-2"></i>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-right-to-bracket me-2"></i>
                        Admin Login
                      </>
                    )}

                  </button>

                </form>

                <div className="text-center mt-4 pt-3 border-top">

                  <p className="text-muted small mb-1">
                    Don't have an admin account?
                  </p>

                  <a
                    href="/admin-register.html"
                    className="fw-bold text-decoration-none"
                    style={{ color: '#0f766e' }}
                  >
                    Register Admin
                  </a>

                </div>

                <div className="text-center mt-3">

                  <a
                    href="/login.html"
                    className="text-decoration-none text-secondary"
                  >
                    Citizen Login
                  </a>

                  <span className="text-muted mx-2">•</span>

                  <a
                    href="/staff-login.html"
                    className="text-decoration-none text-secondary"
                  >
                    Staff Login
                  </a>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

ReactDOM
  .createRoot(document.getElementById('root'))
  .render(<AdminLogin />);