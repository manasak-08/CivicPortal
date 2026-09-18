/**
 * Footer Component (React JSX)
 * Civic branding, helpline numbers, emergency links
 */
function Footer() {
  return (
    <footer className="bg-dark text-white pt-5 pb-3 mt-auto border-top border-secondary">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="badge bg-teal-600 p-2 rounded-3 text-white" style={{ backgroundColor: '#0f766e' }}>
                <i className="fa-solid fa-city fs-5"></i>
              </span>
              <h5 className="mb-0 fw-bold">CivicPortal</h5>
            </div>
            <p className="text-secondary small mb-3">
              Online Complaint Registration and Management System empowering citizens to voice civic concerns
              and municipal authorities to resolve them transparently.
            </p>
            <div className="d-flex gap-2">
              <a href="#" className="btn btn-outline-secondary btn-sm rounded-circle text-white"><i className="fa-brands fa-twitter"></i></a>
              <a href="#" className="btn btn-outline-secondary btn-sm rounded-circle text-white"><i className="fa-brands fa-facebook"></i></a>
              <a href="#" className="btn btn-outline-secondary btn-sm rounded-circle text-white"><i className="fa-brands fa-instagram"></i></a>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold text-uppercase text-teal-400 mb-3" style={{ color: '#5eead4' }}>Quick Links</h6>
            <ul className="list-unstyled text-secondary small d-flex flex-column gap-2 mb-0">
              <li><a href="/" className="text-decoration-none text-secondary hover-white">Home</a></li>
              <li><a href="/login.html" className="text-decoration-none text-secondary hover-white">Citizen Login</a></li>
              <li><a href="/register.html" className="text-decoration-none text-secondary hover-white">Citizen Register</a></li>
              <li><a href="/track-complaint.html" className="text-decoration-none text-secondary hover-white">Track Complaint</a></li>
              <li><a href="/complaint.html" className="text-decoration-none text-secondary hover-white">File Complaint</a></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-uppercase text-teal-400 mb-3" style={{ color: '#5eead4' }}>Portals & Access</h6>
            <ul className="list-unstyled text-secondary small d-flex flex-column gap-2 mb-0">
              <li>
                <a href="/staff-login.html" className="text-decoration-none text-secondary hover-white d-flex align-items-center gap-1">
                  <i className="fa-solid fa-helmet-safety text-warning"></i> Staff Login Portal
                </a>
              </li>
              <li>
                <a href="/admin-login.html" className="text-decoration-none text-secondary hover-white d-flex align-items-center gap-1">
                  <i className="fa-solid fa-shield-halved text-info"></i> Administrator Portal
                </a>
              </li>
              <li>
                <span className="badge bg-dark border border-secondary text-secondary mt-2">
                  <i className="fa-solid fa-circle-check text-success me-1"></i> Multi-Channel SMS & Email Enabled
                </span>
              </li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-uppercase text-teal-400 mb-3" style={{ color: '#5eead4' }}>Civic Helpline</h6>
            <div className="bg-secondary bg-opacity-25 p-3 rounded-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="fa-solid fa-phone-volume text-warning"></i>
                <span className="fw-bold">Toll Free: 1800-111-CIVIC</span>
              </div>
              <div className="d-flex align-items-center gap-2 small text-secondary">
                <i className="fa-solid fa-clock"></i>
                <span>Mon - Sat: 8:00 AM - 8:00 PM</span>
              </div>
              <div className="d-flex align-items-center gap-2 small text-secondary mt-1">
                <i className="fa-solid fa-envelope"></i>
                <span>support@civicportal.gov</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 small text-secondary">
          <div>&copy; {new Date().getFullYear()} Municipal Online Complaint System. All rights reserved.</div>
          <div className="d-flex gap-3">
            <a href="#" className="text-secondary text-decoration-none">Privacy Policy</a>
            <a href="#" className="text-secondary text-decoration-none">Terms of Service</a>
            <a href="#" className="text-secondary text-decoration-none">Citizen Charter</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

window.Footer = Footer;