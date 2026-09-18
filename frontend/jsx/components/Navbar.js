/**
 * Navbar Component (React JSX)
 * Includes responsive navigation, user profile, and Citizen Notification Bell
 */
function Navbar({ activePage = '' }) {
  const [user, setUser] = React.useState(null);
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [loadingNotifs, setLoadingNotifs] = React.useState(false);

  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        if (parsed.role === 'citizen') {
          fetchNotifications();
          // Auto poll notifications every 20 seconds
          const interval = setInterval(fetchNotifications, 20000);
          return () => clearInterval(interval);
        }
      }
    } catch (e) {
      console.error('Navbar user parsing error:', e);
    }
  }, []);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      setLoadingNotifs(true);
      const res = await fetch('/api/notifications?limit=15', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications || []);
        setUnreadCount(data.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const markAllRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (e) {
      console.error('Error marking all notifications read:', e);
    }
  };

  const markSingleRead = async (id, complaintCode) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
      if (complaintCode) {
        window.location.href = `/track-complaint.html?id=${complaintCode}`;
      }
    } catch (e) {
      console.error('Error marking notification read:', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  };

  const isCitizen = user && user.role === 'citizen';
  const isStaff = user && user.role === 'staff';
  const isAdmin = user && user.role === 'admin';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-2">
      <div className="container-fluid px-lg-4">
        {/* Brand Logo */}
        <a className="navbar-brand d-flex align-items-center gap-2 fw-bold" href="/">
          <span className="badge bg-teal-600 p-2 rounded-3 text-white" style={{ backgroundColor: '#0f766e' }}>
            <i className="fa-solid fa-city fs-5"></i>
          </span>
          <div>
            <div className="text-white lh-1 fs-6">CivicPortal</div>
            <small className="text-teal-300 font-monospace" style={{ fontSize: '10px', color: '#5eead4' }}>
              ONLINE COMPLAINT SYSTEM
            </small>
          </div>
        </a>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
            <li className="nav-item">
              <a className={`nav-link px-3 ${activePage === 'home' ? 'active fw-bold text-teal-300' : ''}`} href="/">
                <i className="fa-solid fa-house me-1"></i> Home
              </a>
            </li>

            {/* Citizen Nav Links */}
            {isCitizen && (
              <>
                <li className="nav-item">
                  <a className={`nav-link px-3 ${activePage === 'dashboard' ? 'active fw-bold text-teal-300' : ''}`} href="/dashboard.html">
                    <i className="fa-solid fa-gauge me-1"></i> Dashboard
                  </a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link px-3 ${activePage === 'complaint' ? 'active fw-bold text-teal-300' : ''}`} href="/complaint.html">
                    <i className="fa-solid fa-circle-plus me-1"></i> File Complaint
                  </a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link px-3 ${activePage === 'my-complaints' ? 'active fw-bold text-teal-300' : ''}`} href="/my-complaints.html">
                    <i className="fa-solid fa-list-check me-1"></i> My Complaints
                  </a>
                </li>
              </>
            )}

            {/* Public Track Link */}
            <li className="nav-item">
              <a className={`nav-link px-3 ${activePage === 'track' ? 'active fw-bold text-teal-300' : ''}`} href="/track-complaint.html">
                <i className="fa-solid fa-magnifying-glass-location me-1"></i> Track Status
              </a>
            </li>

            {/* Staff Nav Links */}
            {isStaff && (
              <li className="nav-item">
                <a className={`nav-link px-3 ${activePage === 'staff' ? 'active fw-bold text-teal-300' : ''}`} href="/staff.html">
                  <i className="fa-solid fa-helmet-safety me-1"></i> Field Tasks
                </a>
              </li>
            )}

            {/* Admin Nav Links */}
            {isAdmin && (
              <li className="nav-item">
                <a className={`nav-link px-3 ${activePage === 'admin' ? 'active fw-bold text-teal-300' : ''}`} href="/admin.html">
                  <i className="fa-solid fa-shield-halved me-1"></i> Admin Panel
                </a>
              </li>
            )}
          </ul>

          {/* Right Action Icons & Controls */}
          <div className="d-flex align-items-center gap-3">
            {/* Citizen Notification Bell */}
            {isCitizen && (
              <div className="position-relative">
                <button
                  type="button"
                  className="btn btn-outline-light position-relative rounded-circle p-2 border-0 bg-transparent text-white"
                  style={{ width: '42px', height: '42px' }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  title="Citizen Alerts & Notifications"
                >
                  <i className="fa-solid fa-bell fs-5"></i>
                  {unreadCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light"
                      style={{ fontSize: '10px' }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                      <span className="visually-hidden">unread notifications</span>
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Drawer */}
                {showNotifications && (
                  <div
                    className="position-absolute end-0 mt-2 card shadow-lg border-0 rounded-4 overflow-hidden"
                    style={{ width: '360px', zIndex: 1050, maxHeight: '480px' }}
                  >
                    <div className="card-header bg-teal-800 text-white d-flex justify-content-between align-items-center py-2 px-3" style={{ backgroundColor: '#0f766e' }}>
                      <div className="d-flex align-items-center gap-2">
                        <i className="fa-solid fa-bell"></i>
                        <span className="fw-bold">Citizen Notifications</span>
                        {unreadCount > 0 && <span className="badge bg-warning text-dark">{unreadCount} New</span>}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          className="btn btn-sm btn-link text-white text-decoration-none p-0"
                          style={{ fontSize: '12px' }}
                          onClick={markAllRead}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="card-body p-0 overflow-y-auto" style={{ maxHeight: '380px' }}>
                      {loadingNotifs && notifications.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                          <i className="fa-solid fa-spinner fa-spin me-2"></i> Loading alerts...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                          <i className="fa-regular fa-bell-slash fs-3 mb-2 d-block text-secondary opacity-50"></i>
                          <p className="mb-0 small">No notifications yet</p>
                          <small className="text-xs text-secondary">You will be alerted when staff/admin updates your complaints.</small>
                        </div>
                      ) : (
                        <div className="list-group list-group-flush">
                          {notifications.map((n) => (
                            <div
                              key={n._id}
                              className={`list-group-item list-group-item-action p-3 border-bottom ${
                                !n.is_read ? 'bg-light fw-medium border-start border-3 border-teal-600' : 'opacity-75'
                              }`}
                              style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                              onClick={() => markSingleRead(n._id, n.complaint_code)}
                            >
                              <div className="d-flex justify-content-between align-items-start mb-1">
                                <span className="badge bg-teal-100 text-teal-800 rounded-pill font-monospace" style={{ backgroundColor: '#ccfbf1', color: '#0f766e', fontSize: '10px' }}>
                                  {n.complaint_code || 'ALERT'}
                                </span>
                                <small className="text-muted text-xs" style={{ fontSize: '10px' }}>
                                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </small>
                              </div>
                              <h6 className="mb-1 text-sm fw-bold text-dark">{n.title}</h6>
                              <p className="mb-1 text-xs text-secondary lh-sm" style={{ fontSize: '12px' }}>{n.message}</p>
                              
                              {/* Delivery Badges */}
                              <div className="d-flex align-items-center gap-2 mt-2 pt-1 border-top border-light">
                                <span className="text-xs text-muted" style={{ fontSize: '10px' }}>Channels:</span>
                                {n.channels?.in_app?.sent && (
                                  <span className="badge bg-light text-secondary border text-xs" title="In-App Alert Delivered" style={{ fontSize: '9px' }}>
                                    🔔 App
                                  </span>
                                )}
                                {n.channels?.email?.sent && (
                                  <span className="badge bg-light text-primary border text-xs" title="Gmail Alert Delivered" style={{ fontSize: '9px' }}>
                                    ✉️ Gmail
                                  </span>
                                )}
                                {n.channels?.sms?.sent && (
                                  <span className="badge bg-light text-success border text-xs" title="SMS Alert Delivered" style={{ fontSize: '9px' }}>
                                    📱 SMS
                                  </span>
                                )}
                                {!n.is_read && <span className="ms-auto badge bg-danger text-xs" style={{ fontSize: '9px' }}>New</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="card-footer bg-light py-2 text-center">
                      <a href="/track-complaint.html" className="text-decoration-none text-teal-700 fw-bold small" style={{ color: '#0f766e', fontSize: '12px' }}>
                        Track Complaints & Updates &rarr;
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Authenticated User Menu */}
            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light btn-sm dropdown-toggle d-flex align-items-center gap-2 rounded-pill px-3"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fa-solid fa-user-circle fs-6"></i>
                  <span className="fw-semibold text-truncate" style={{ maxWidth: '120px' }}>
                    {user.name || user.email}
                  </span>
                  <span className="badge bg-secondary text-uppercase" style={{ fontSize: '9px' }}>
                    {user.role}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-2">
                  <li className="dropdown-header text-xs text-uppercase font-monospace">Logged in as {user.role}</li>
                  <li><hr className="dropdown-divider" /></li>
                  {isCitizen && (
                    <>
                      <li><a className="dropdown-item" href="/dashboard.html"><i className="fa-solid fa-gauge me-2"></i>Dashboard</a></li>
                      <li><a className="dropdown-item" href="/complaint.html"><i className="fa-solid fa-plus-circle me-2"></i>New Complaint</a></li>
                      <li><a className="dropdown-item" href="/my-complaints.html"><i className="fa-solid fa-list me-2"></i>My Complaints</a></li>
                    </>
                  )}
                  {isStaff && <li><a className="dropdown-item" href="/staff.html"><i className="fa-solid fa-helmet-safety me-2"></i>Field Tasks</a></li>}
                  {isAdmin && <li><a className="dropdown-item" href="/admin.html"><i className="fa-solid fa-shield-halved me-2"></i>Admin Dashboard</a></li>}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={handleLogout}>
                      <i className="fa-solid fa-right-from-bracket"></i> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              /* Guest Actions */
              <div className="d-flex align-items-center gap-2">
                <a href="/login.html" className="btn btn-outline-light btn-sm rounded-pill px-3">
                  <i className="fa-solid fa-arrow-right-to-bracket me-1"></i> Citizen Login
                </a>
                <a href="/register.html" className="btn btn-teal btn-sm text-white rounded-pill px-3" style={{ backgroundColor: '#0f766e' }}>
                  <i className="fa-solid fa-user-plus me-1"></i> Register
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

window.Navbar = Navbar;