document.addEventListener('DOMContentLoaded', async () => {
  if (!UI.guardAuth()) return;

  const searchInput = document.getElementById('search-input');
  const filterCat = document.getElementById('filter-category');
  const filterStatus = document.getElementById('filter-status');
  const resetBtn = document.getElementById('reset-filter-btn');

  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadComplaints, 300);
  });

  filterCat.addEventListener('change', loadComplaints);
  filterStatus.addEventListener('change', loadComplaints);

  resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    filterCat.value = 'all';
    filterStatus.value = 'all';
    loadComplaints();
  });

  await loadComplaints();
});

async function loadComplaints() {
  const tbody = document.getElementById('complaints-tbody');
  const search = document.getElementById('search-input').value.trim();
  const category = document.getElementById('filter-category').value;
  const status = document.getElementById('filter-status').value;

  try {
    const res = await API.getCitizenComplaints({ search, category, status });
    const { complaints } = res.data;

    if (!complaints || complaints.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-5 text-muted">
            <i class="bi bi-search fs-2 d-block mb-2"></i>
            No complaints found matching the selected filters.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = complaints.map(c => `
      <tr>
        <td class="ps-3 fw-bold text-primary">${c.complaint_id}</td>
        <td>${UI.getCategoryBadge(c.category)}</td>
        <td>
          <div class="fw-semibold">${c.title}</div>
          <small class="text-muted"><i class="bi bi-geo-alt"></i> ${c.location} ${c.landmark ? ' (' + c.landmark + ')' : ''}</small>
        </td>
        <td>${UI.formatDate(c.created_at)}</td>
        <td>
          ${c.assigned_staff_id ? `
            <span class="badge bg-light text-dark border">
              <i class="bi bi-person-check text-success me-1"></i>${c.assigned_staff_id.name}
            </span>
          ` : '<span class="text-muted small">Not yet assigned</span>'}
        </td>
        <td>${UI.getStatusBadge(c.status)}</td>
        <td class="text-end pe-3">
          <div class="btn-group">
            <button class="btn btn-sm btn-outline-primary view-details-btn" data-id="${c.complaint_id}">
              <i class="bi bi-eye"></i> Details
            </button>
            <a href="/track-complaint.html?id=${c.complaint_id}" class="btn btn-sm btn-outline-secondary">
              <i class="bi bi-diagram-3"></i>
            </a>
          </div>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', () => openDetailsModal(btn.dataset.id));
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">${err.message}</td></tr>`;
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
          ${complaint.landmark ? `<p class="mb-1"><strong><i class="bi bi-signpost text-primary"></i> Landmark:</strong> ${complaint.landmark}</p>` : ''}
          <p class="mb-1"><strong><i class="bi bi-calendar3"></i> Submitted:</strong> ${UI.formatDate(complaint.created_at)}</p>
          <p class="mb-1"><strong><i class="bi bi-person-badge"></i> Assigned Staff:</strong> ${complaint.assigned_staff_id ? complaint.assigned_staff_id.name : '<span class="text-muted">Awaiting assignment</span>'}</p>
        </div>
        <div class="col-md-5 text-center">
          ${complaint.image ? `
            <img src="${complaint.image}" class="img-fluid rounded border shadow-sm" style="max-height: 220px; object-fit: cover;" alt="Photo">
          ` : `
            <div class="p-4 bg-light border rounded text-muted">
              <i class="bi bi-image fs-1 d-block mb-1"></i>
              No photo attached
            </div>
          `}
        </div>
      </div>
      <hr>
      <h6 class="fw-bold mb-3"><i class="bi bi-clock-history text-secondary me-1"></i> Status History &amp; Remarks</h6>
      <div class="timeline">
        ${updates.map((u, i) => `
          <div class="timeline-item">
            <div class="timeline-dot ${i === updates.length - 1 ? 'active' : ''}"></div>
            <div class="timeline-content">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="fw-bold">${UI.getStatusBadge(u.status)}</span>
                <span class="timeline-date">${UI.formatDate(u.updated_at)}</span>
              </div>
              <p class="small mb-0 text-secondary">${u.remarks}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    modalBody.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}