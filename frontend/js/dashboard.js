document.addEventListener('DOMContentLoaded', async () => {
  if (!UI.guardAuth()) return;

  const user = API.getUser();
  if (user) {
    document.getElementById('citizen-name').textContent = `Welcome, ${user.name}`;
  }

  await loadDashboardData();
});

async function loadDashboardData() {
  try {
    const res = await API.getCitizenComplaints();
    const { complaints, counts } = res.data;

    
    document.getElementById('count-total').textContent = counts.total || 0;
    document.getElementById('count-pending').textContent = counts.pending || 0;
    document.getElementById('count-progress').textContent = counts.in_progress || 0;
    document.getElementById('count-resolved').textContent = counts.resolved || 0;
    document.getElementById('count-closed').textContent = counts.closed || 0;

  
    const tbody = document.getElementById('recent-complaints-tbody');
    const recent = complaints.slice(0, 5);

    if (recent.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-5 text-muted">
            <i class="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
            <p class="mb-2">You haven't registered any complaints yet.</p>
            <a href="/complaint.html" class="btn btn-sm btn-warning text-dark fw-bold">Register Your First Complaint</a>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = recent.map(c => `
      <tr>
        <td class="ps-3 fw-bold text-primary">${c.complaint_id}</td>
        <td>${UI.getCategoryBadge(c.category)}</td>
        <td>
          <div class="fw-semibold text-truncate" style="max-width: 250px;">${c.title}</div>
          <small class="text-muted"><i class="bi bi-geo-alt"></i> ${c.location}</small>
        </td>
        <td>${UI.formatDate(c.created_at)}</td>
        <td>${UI.getStatusBadge(c.status)}</td>
        <td class="text-end pe-3">
          <button class="btn btn-sm btn-outline-primary view-details-btn" data-id="${c.complaint_id}">
            <i class="bi bi-eye me-1"></i> View Details
          </button>
        </td>
      </tr>
    `).join('');

    // Attach click handlers
    document.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', () => openDetailsModal(btn.dataset.id));
    });

  } catch (err) {
    console.error('Error loading dashboard:', err);
    document.getElementById('recent-complaints-tbody').innerHTML = `
      <tr><td colspan="6" class="text-center text-danger py-4">Error loading complaints: ${err.message}</td></tr>
    `;
  }
}

async function openDetailsModal(complaintId) {
  const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
  const modalBody = document.getElementById('modal-body-content');
  const modalTitle = document.getElementById('modal-title');
  const modalTrackLink = document.getElementById('modal-track-link');

  modalTitle.textContent = `Complaint ${complaintId}`;
  modalTrackLink.href = `/track-complaint.html?id=${complaintId}`;
  modalBody.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>';
  modal.show();

  try {
    const res = await API.trackComplaint(complaintId);
    const { complaint, updates } = res.data;

    modalBody.innerHTML = `
      <div class="row g-3">
        <div class="col-md-7">
          <div class="mb-2">${UI.getCategoryBadge(complaint.category)} ${UI.getStatusBadge(complaint.status)}</div>
          <h5 class="fw-bold mb-2">${complaint.title}</h5>
          <p class="text-muted mb-3">${complaint.description}</p>
          <p class="mb-1"><strong><i class="bi bi-geo-alt text-danger"></i> Location:</strong> ${complaint.location}</p>
          ${complaint.landmark ? `<p class="mb-1"><strong><i class="bi bi-signpost-2 text-primary"></i> Landmark:</strong> ${complaint.landmark}</p>` : ''}
          <p class="mb-1"><strong><i class="bi bi-calendar3"></i> Submitted:</strong> ${UI.formatDate(complaint.created_at)}</p>
          <p class="mb-1"><strong><i class="bi bi-person-badge"></i> Assigned Staff:</strong> ${complaint.assigned_staff_id ? complaint.assigned_staff_id.name : '<span class="text-muted">Awaiting assignment</span>'}</p>
        </div>
        <div class="col-md-5 text-center">
          ${complaint.image ? `
            <img src="${complaint.image}" class="img-fluid rounded border shadow-sm" style="max-height: 220px; object-fit: cover;" alt="Complaint Photo">
          ` : `
            <div class="p-4 bg-light border rounded text-muted">
              <i class="bi bi-image fs-1 d-block mb-1"></i>
              No photo uploaded
            </div>
          `}
        </div>
      </div>
      <hr>
      <h6 class="fw-bold mb-3"><i class="bi bi-clock-history text-secondary me-1"></i> Status History</h6>
      <div class="timeline">
        ${updates.map((u, i) => `
          <div class="timeline-item">
            <div class="timeline-dot ${i === updates.length - 1 ? 'active' : ''}"></div>
            <div class="timeline-content">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="fw-bold text-dark">${UI.getStatusBadge(u.status)}</span>
                <span class="timeline-date">${UI.formatDate(u.updated_at)}</span>
              </div>
              <p class="small mb-0 text-secondary">${u.remarks}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    modalBody.innerHTML = `<div class="alert alert-danger">Failed to load details: ${err.message}</div>`;
  }
}