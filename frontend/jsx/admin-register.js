function AdminRegister() {

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = React.useState(false);

  const [message, setMessage] = React.useState({
    type: '',
    text: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage({
      type: '',
      text: ''
    });

    // Password check
    if (formData.password !== formData.confirmPassword) {
      setMessage({
        type: 'danger',
        text: 'Passwords do not match.'
      });
      return;
    }

    // Minimum password length
    if (formData.password.length < 6) {
      setMessage({
        type: 'danger',
        text: 'Password must be at least 6 characters.'
      });
      return;
    }

    try {

      setLoading(true);

      const response = await fetch('/api/admin/register', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Admin registration failed.'
        );
      }

      setMessage({
        type: 'success',
        text: 'Admin registered successfully! Redirecting to login...'
      });

      // Clear form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: ''
      });

      // Redirect to admin login
      setTimeout(() => {
        window.location.href = '/admin-login.html';
      }, 1500);

    } catch (error) {

      console.error('Admin registration error:', error);

      setMessage({
        type: 'danger',
        text: error.message || 'Unable to connect to server.'
      });

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="container py-5">

      <div className="row justify-content-center">

        <div className="col-md-7 col-lg-6">

          <div className="card border-0 shadow-lg rounded-4">

            {/* Header */}
            <div
              className="card-header text-white text-center py-4 rounded-top-4"
              style={{ backgroundColor: '#0f766e' }}
            >

              <div className="mb-2">
                <i className="fa-solid fa-user-shield fa-2x"></i>
              </div>

              <h3 className="fw-bold mb-1">
                Admin Registration
              </h3>

              <p className="mb-0 small">
                CivicPortal Administration
              </p>

            </div>

            {/* Body */}
            <div className="card-body p-4 p-md-5">

              {message.text && (

                <div
                  className={`alert alert-${message.type} rounded-3`}
                  role="alert"
                >
                  {message.text}
                </div>

              )}

              <form onSubmit={handleSubmit}>

                {/* Name */}
                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Enter admin full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* Email */}
                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="admin@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* Phone */}
                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* Address */}
                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    Address
                  </label>

                  <textarea
                    name="address"
                    className="form-control"
                    rows="2"
                    placeholder="Enter admin address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  ></textarea>

                </div>

                {/* Password */}
                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                  />

                </div>

                {/* Confirm Password */}
                <div className="mb-4">

                  <label className="form-label fw-semibold">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength="6"
                  />

                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  className="btn w-100 text-white rounded-pill py-2 fw-bold"
                  style={{ backgroundColor: '#0f766e' }}
                  disabled={loading}
                >

                  {loading ? (

                    <>
                      <i className="fa-solid fa-spinner fa-spin me-2"></i>
                      Registering...
                    </>

                  ) : (

                    <>
                      <i className="fa-solid fa-user-plus me-2"></i>
                      Register Admin
                    </>

                  )}

                </button>

              </form>

              {/* Login Link */}
              <div className="text-center mt-4">

                <span className="text-muted">
                  Already have an admin account?
                </span>

                <br />

                <a
                  href="/admin-login.html"
                  className="fw-bold text-decoration-none"
                  style={{ color: '#0f766e' }}
                >
                  Admin Login
                </a>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


// Render React component
ReactDOM
  .createRoot(document.getElementById('root'))
  .render(<AdminRegister />);