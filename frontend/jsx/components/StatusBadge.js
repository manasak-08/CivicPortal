/**
 * StatusBadge Component (React JSX)
 * Color-coded status badge with civic icons
 */
function StatusBadge({ status }) {
  const getBadgeConfig = (s) => {
    switch ((s || '').toLowerCase()) {
      case 'submitted':
        return { bg: 'bg-primary', icon: 'fa-circle-check', text: 'Submitted' };
      case 'pending':
        return { bg: 'bg-warning text-dark', icon: 'fa-clock', text: 'Pending' };
      case 'assigned':
        return { bg: 'bg-info text-dark', icon: 'fa-user-gear', text: 'Assigned' };
      case 'in progress':
        return { bg: 'bg-primary', icon: 'fa-spinner fa-spin', text: 'In Progress' };
      case 'resolved':
        return { bg: 'bg-success', icon: 'fa-check-double', text: 'Resolved' };
      case 'closed':
        return { bg: 'bg-secondary', icon: 'fa-lock', text: 'Closed' };
      case 'rejected':
        return { bg: 'bg-danger', icon: 'fa-circle-xmark', text: 'Rejected' };
      default:
        return { bg: 'bg-light text-dark', icon: 'fa-info-circle', text: s || 'Unknown' };
    }
  };

  const config = getBadgeConfig(status);

  return (
    <span className={`badge ${config.bg} px-2.5 py-1.5 rounded-pill shadow-xs d-inline-flex align-items-center gap-1.5 font-monospace`}>
      <i className={`fa-solid ${config.icon} text-xs`}></i>
      <span>{config.text}</span>
    </span>
  );
}

window.StatusBadge = StatusBadge;