/**
 * CivicPortal - Citizen Login
 */
function LoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);

        if (parsedUser.role === 'citizen') {
          window.location.href = '/dashboard.html';
        }
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, []);

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

      console.log('Sending citizen login request...');

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: password
        })
      });

      console.log('Login HTTP Status:', response.status);

      const result = await response.json();

      console.log('Citizen Login Response:', result);

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || 'Invalid email or password.'
        );
      }

      // Support both possible response formats
      const loginData = result.data || result;

      const token = loginData.token;
      const user = loginData.user;

      console.log('Token received:', !!token);
      console.log('User received:', user);

      if (!token) {
        throw new Error(
          'Login successful, but authentication token was not received.'
        );
      }

      if (!user) {
        throw new Error(
          'Login successful, but user information was not received.'
        );
      }

      if (user.role !== 'citizen') {
        throw new Error(
          'This login is only for Citizen accounts.'
        );
      }

      // Save login information
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('Token saved successfully.');
      console.log('User saved successfully.');

      // Redirect
      window.location.href = '/dashboard.html';

    } catch (err) {
      console.error('Citizen Login Error:', err);

      setError(
        err.message || 'Unable to login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">

      <Navbar activePage="login" />

      <div className="container my-auto py-5">

        <div className="row justify-content-center">

          <div className="col-lg-5 col-md-8">

            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">

              {/* HEADER */}
              <div
                className="text-white p-4 text-center"
                style={{ backgroundColor: '#0f766e' }}
              >

                <span
                  className="badge bg-white rounded-pill px-3 py-1 mb-2"
                  style={{ color: '#0f766e' }}
                >
                  <i className="fa-solid fa-user me-1"></i>
                  CITIZEN PORTAL
                </span>

                <h3 className="fw-bold mb-1">
                  Citizen Login
                </h3>

                <p className="small mb-0">
                  Sign in to manage and track your civic complaints
                </p>

              </div>

              {/* BODY */}
              <div className="card-body p-4 p-md-5">

                {error && (
                  <div
                    className="alert alert-danger"
                    role="alert"
                  >
                    <i className="fa-solid fa-circle-exclamation me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>

                  {/* EMAIL */}
                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Registered Email
                    </label>

                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />

                  </div>

                  {/* PASSWORD */}
                  <div className="mb-4">

                    <label className="form-label fw-semibold">
                      Password
                    </label>

                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />

                  </div>

                  {/* LOGIN BUTTON */}
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
                        Login to Dashboard
                      </>
                    )}

                  </button>

                </form>

                {/* REGISTER */}
                <div className="text-center mt-4 pt-3 border-top">

                  <p className="text-muted small">
                    Don't have a citizen account?
                  </p>

                  <a
                    href="/register.html"
                    className="fw-bold text-decoration-none"
                    style={{ color: '#0f766e' }}
                  >
                    Register here
                  </a>

                </div>

                {/* OTHER LOGINS */}
                <div className="text-center mt-3">

                  <a
                    href="/staff-login.html"
                    className="text-decoration-none text-secondary me-3"
                  >
                    Staff Login
                  </a>

                  <span className="text-muted">•</span>

                  <a
                    href="/admin-login.html"
                    className="text-decoration-none text-secondary ms-3"
                  >
                    Admin Login
                  </a>

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


ReactDOM
  .createRoot(document.getElementById('root'))
  .render(<LoginPage />);
  