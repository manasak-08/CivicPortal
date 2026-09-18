/**
 * Timeline Component (React JSX)
 * Visual step-by-step complaint progress and chronological history
 */
function Timeline({ currentStatus, updates = [] }) {
  const steps = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

  const getStepIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'submitted') return 0;
    if (s === 'pending') return 0;
    if (s === 'assigned') return 1;
    if (s === 'in progress') return 2;
    if (s === 'resolved') return 3;
    if (s === 'closed') return 4;
    if (s === 'rejected') return -1;
    return 0;
  };

  const currentIndex = getStepIndex(currentStatus);
  const isRejected = (currentStatus || '').toLowerCase() === 'rejected';

  return (
    <div className="civic-timeline-container my-4">
      {isRejected ? (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <i className="fa-solid fa-triangle-exclamation fs-4"></i>
          <div>
            <strong>Complaint Rejected:</strong> This complaint has been reviewed and marked as rejected by the municipal administration.
          </div>
        </div>
      ) : (
        <div className="progress-steps d-flex justify-content-between position-relative mb-5">
          <div className="progress-line-track position-absolute top-50 start-0 w-100 translate-middle-y" style={{ height: '4px', backgroundColor: '#e2e8f0', zIndex: 1 }}></div>
          <div
            className="progress-line-active position-absolute top-50 start-0 translate-middle-y"
            style={{
              height: '4px',
              backgroundColor: '#0f766e',
              zIndex: 2,
              width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%`,
              transition: 'width 0.4s ease'
            }}
          ></div>

          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <div key={step} className="step-point text-center position-relative" style={{ zIndex: 3 }}>
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center mx-auto shadow-sm transition-all ${
                    isCurrent
                      ? 'bg-primary text-white ring-4 ring-teal-100'
                      : isCompleted
                      ? 'bg-teal-700 text-white'
                      : 'bg-white text-muted border border-2'
                  }`}
                  style={{
                    width: '38px',
                    height: '38px',
                    backgroundColor: isCompleted ? '#0f766e' : '#ffffff',
                    color: isCompleted ? '#ffffff' : '#94a3b8'
                  }}
                >
                  {isCompleted ? <i className="fa-solid fa-check text-xs"></i> : <span>{idx + 1}</span>}
                </div>
                <div className={`mt-2 text-xs font-semibold ${isCompleted ? 'text-teal-900 fw-bold' : 'text-muted'}`}>
                  {step}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chronological updates log */}
      {updates && updates.length > 0 && (
        <div className="timeline-history mt-4">
          <h6 className="fw-bold text-muted mb-3 text-uppercase font-monospace text-xs">
            <i className="fa-solid fa-clock-rotate-left me-2"></i> Activity & Remark History
          </h6>
          <div className="border-start border-2 border-teal-200 ps-3 ms-2">
            {updates.map((up, i) => (
              <div key={i} className="mb-3 position-relative">
                <div
                  className="position-absolute top-0 rounded-circle bg-teal-600"
                  style={{ left: '-21px', width: '10px', height: '10px', backgroundColor: '#0f766e' }}
                ></div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-light text-dark border font-monospace text-xs">
                    {up.status}
                  </span>
                  <span className="text-muted text-xs">
                    {new Date(up.updated_at || up.created_at).toLocaleString()}
                  </span>
                  {up.staff_id && (
                    <span className="badge bg-info-subtle text-info-emphasis text-xs">
                      {up.staff_id.name || 'Officer'}
                    </span>
                  )}
                </div>
                <p className="mb-0 text-sm text-secondary mt-1 bg-light p-2 rounded border">
                  {up.remarks || 'Status update logged.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

window.Timeline = Timeline;