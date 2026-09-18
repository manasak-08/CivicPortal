/**
 * Home Component (React JSX)
 * Civic Portal Landing Page with 4 Category Cards, Quick Tracking, and Notification Highlights
 */
function HomePage() {
  const [trackId, setTrackId] = React.useState('');
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    try {
      const u = localStorage.getItem('user');
      if (u) setUser(JSON.parse(u));
    } catch (e) {}
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!trackId.trim()) return;
    window.location.href = `/track-complaint.html?id=${encodeURIComponent(trackId.trim())}`;
  };

  const categories = [
    {
      title: 'Street Light Problems',
      desc: 'Report non-functioning LED lamps, flickering poles, exposed wiring, and broken fixtures.',
      icon: 'fa-lightbulb',
      color: '#eab308',
      bg: '#fefce8'
    },
    {
      title: 'Water Pipe Leakage',
      desc: 'Report burst main pipelines, low pressure, valve leakages, and contaminated tap water.',
      icon: 'fa-faucet-drip',
      color: '#0284c7',
      bg: '#f0f9ff'
    },
    {
      title: 'Rain Water Drainage',
      desc: 'Report clogged storm drains, roadside waterlogging, monsoon overflow, and damaged manholes.',
      icon: 'fa-cloud-showers-water',
      color: '#0d9488',
      bg: '#f0fdfa'
    },
    {
      title: 'Roadside Cleaning',
      desc: 'Report uncollected garbage piles, open dumping, unswept streets, and sanitary hazards.',
      icon: 'fa-broom',
      color: '#ca8a04',
      bg: '#fefce8'
    }
  ];

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar activePage="home" />

      {/* Hero Section */}
      <section className="civic-hero py-5 text-white" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0f766e 100%)' }}>
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge bg-teal-500 bg-opacity-25 text-teal-200 border border-teal-400 px-3 py-1 rounded-pill mb-3" style={{ color: '#99f6e4', borderColor: '#2dd4bf' }}>
                <i className="fa-solid fa-bell me-1"></i> Citizen Notification Enabled (In-App, Gmail & SMS)
              </span>
              <h1 className="display-5 fw-bold mb-3 lh-sm">
                Online Complaint Registration & Management System
              </h1>
              <p className="lead text-slate-200 mb-4 opacity-90">
                Report civic problems and track their resolution easily. Receive instant notification updates
                whenever field staff or municipal administrators work on your complaint.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-4">
                <a href="/complaint.html" className="btn btn-warning btn-lg fw-bold px-4 py-3 rounded-pill shadow">
                  <i className="fa-solid fa-plus-circle me-2"></i> Register Complaint
                </a>
                <a href="/track-complaint.html" className="btn btn-outline-light btn-lg px-4 py-3 rounded-pill">
                  <i className="fa-solid fa-magnifying-glass me-2"></i> Track Complaint
                </a>
                {!user && (
                  <a href="/login.html" className="btn btn-light btn-lg px-4 py-3 rounded-pill text-dark">
                    <i className="fa-solid fa-arrow-right-to-bracket me-2"></i> Citizen Login
                  </a>
                )}
              </div>
            </div>

            {/* Quick Track Card */}
            <div className="col-lg-5">
              <div className="card shadow-lg border-0 rounded-4 p-4 text-dark bg-white">
                <div className="d-flex align-items-center gap-2 mb-2 text-teal-800" style={{ color: '#0f766e' }}>
                  <i className="fa-solid fa-satellite-dish fs-4"></i>
                  <h4 className="fw-bold mb-0">Track Complaint Status</h4>
                </div>
                <p className="text-secondary small mb-3">
                  Check live progress, assigned field officers, and remarks in real-time.
                </p>

                <form onSubmit={handleTrackSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Complaint ID</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light"><i className="fa-solid fa-ticket text-muted"></i></span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. CMP-2026-0001"
                        value={trackId}
                        onChange={(e) => setTrackId(e.target.value)}
                        required
                      />
                    </div>
                    <small className="text-muted text-xs">Enter your 13-character complaint registration reference.</small>
                  </div>
                  <button type="submit" className="btn btn-teal w-100 text-white fw-bold py-2.5 rounded-3" style={{ backgroundColor: '#0f766e' }}>
                    <i className="fa-solid fa-magnifying-glass me-2"></i> Check Status Now
                  </button>
                </form>

                <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center text-xs text-muted">
                  <span><i className="fa-solid fa-shield-check text-success me-1"></i> Public Access</span>
                  <span><i className="fa-solid fa-bolt text-warning me-1"></i> Instant Results</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Category Cards */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="text-center max-w-xl mx-auto mb-5">
            <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill px-3 py-1 uppercase text-xs">Civic Services</span>
            <h2 className="fw-bold mt-2">Civic Problem Categories</h2>
            <p className="text-muted">Choose your category to register a civic complaint directly to the municipal team.</p>
          </div>

          <div className="row g-4">
            {categories.map((cat, i) => (
              <div key={i} className="col-lg-3 col-md-6">
                <div className="card h-100 border-0 shadow-sm rounded-4 p-4 transition-all hover-shadow" style={{ backgroundColor: '#ffffff' }}>
                  <div
                    className="rounded-4 d-inline-flex align-items-center justify-content-center mb-3 shadow-xs"
                    style={{ width: '60px', height: '60px', backgroundColor: cat.bg, color: cat.color }}
                  >
                    <i className={`fa-solid ${cat.icon} fs-3`}></i>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">{cat.title}</h5>
                  <p className="text-secondary small mb-4 flex-grow-1">{cat.desc}</p>
                  <a href={`/complaint.html?category=${encodeURIComponent(cat.title)}`} className="btn btn-outline-teal btn-sm fw-semibold rounded-pill w-100" style={{ borderColor: '#0f766e', color: '#0f766e' }}>
                    Report Problem &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works & Notification Highlights */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold">How Citizen Complaints Are Resolved</h2>
            <p className="text-muted">Transparent 4-step civic resolution with proactive communication</p>
          </div>

          <div className="row g-4 text-center">
            <div className="col-md-3">
              <div className="p-3">
                <div className="rounded-circle bg-teal-100 text-teal-800 d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '64px', height: '64px', backgroundColor: '#ccfbf1', color: '#0f766e' }}>
                  <i className="fa-solid fa-file-pen fs-4"></i>
                </div>
                <h5 className="fw-bold">1. Citizen Submits</h5>
                <p className="text-secondary small">Citizen registers complaint with location, details, and optional photo upload.</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="p-3">
                <div className="rounded-circle bg-blue-100 text-blue-800 d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '64px', height: '64px', backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
                  <i className="fa-solid fa-user-gear fs-4"></i>
                </div>
                <h5 className="fw-bold">2. Admin Assigns</h5>
                <p className="text-secondary small">Municipal admin reviews and assigns the task to designated field maintenance staff.</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="p-3">
                <div className="rounded-circle bg-purple-100 text-purple-800 d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '64px', height: '64px', backgroundColor: '#f3e8ff', color: '#7e22ce' }}>
                  <i className="fa-solid fa-bell fs-4"></i>
                </div>
                <h5 className="fw-bold">3. Proactive Alert</h5>
                <p className="text-secondary small">Citizen instantly receives In-App notification, Gmail update, and SMS message.</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="p-3">
                <div className="rounded-circle bg-green-100 text-green-800 d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '64px', height: '64px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                  <i className="fa-solid fa-circle-check fs-4"></i>
                </div>
                <h5 className="fw-bold">4. Resolved & Closed</h5>
                <p className="text-secondary small">Staff inspects, repairs the issue on ground, and marks the complaint Resolved with remarks.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<HomePage />);