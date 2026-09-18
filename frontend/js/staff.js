document.addEventListener('DOMContentLoaded', async () => {
  if (!UI.guardAuth('staff')) return;

  const user = API.getUser();
  if (user) {
    document.getElementById('staff-greeting').textContent = `Welcome, ${user.name}`;
    document.getElementById('staff-header-info').textContent = `Staff: ${user.name}`;
  }

  document.getElementById('staff-logout-btn')?.addEventListener('click', () => {
    API.removeToken();
    window.location.href = '/login.html';
  });

  document.getElementById('staff-search-input')?.addEventListener('input', debounce(loadStaffComplaints, 300));
  document.getElementById('staff-filter-status')?.addEventListener('change', loadStaffComplaints);
  document.getElementById('staff-refresh-btn')?.addEventListener('click', loadStaffComplaints);

  document.getElementById('staff-status-form')?.addEventListener('submit', handleStaffStatusSubmit);

  await loadStaffComplaints();
});

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

async function loadStaffComplaints() {
  const tbody = document.getElementById('staff-complaints-tbody');
  const search = document.getElementById('staff-search-input')?.value.trim();
  const status = document.getElementById('staff-filter-status')?.value;

  try {
    const res = await API.getStaffComplaints({ search, status });
    const { complaints, counts } = res.data;

    // Update Counters
    document.getElementById('staff-stat-total').textContent = counts.total || 0;
    document.getElementById('staff-stat-assigned').textContent = counts.assigned || 0;
    document.getElementById('staff-stat-progress').textContent = counts.in_progress || 0;
    document.getElementById('staff-stat-resolved').textContent = counts.resolved || 0;

    if (!complaints || complaints.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center py-5 text-muted">No complaints assigned to you matching the filter.</td></tr>';
      return;
    }

    tbody.innerHTML = complaints.map(c => `
      <tr>
        <td class="ps-3 fw-bold text-primary">${c.complaint_id}</td>
        <td>${UI.getCategoryBadge(c.category)}</td>
        <td>
          <div class="fw-bold">${c.title}</div>
          <p class="text-muted small mb-0 text-truncate" style="max-width: 250px;">${c.description}</p>
        </td>
        <td>
          <div><i class="bi bi-geo-alt text-danger me-1"></i>${c.location}</div>
          ${c.landmark ? `<small class="text-muted"><i class="bi bi-signpost me-1"></i>${c.landmark}</small>` : ''}
        </td>
        <td>${UI.getStatusBadge(c.status)}</td>
        <td><small class="text-muted">${UI.formatDate(c.updated_at)}</small></td>
        <td class="text-end pe-3">
          <div class="btn-group">
            <button class="btn btn-sm btn-outline-primary" onclick="openStaffDetails('${c.complaint_id}')">
              <i class="bi bi-eye"></i> View
            </button>
            <button class="btn btn-sm btn-success" onclick="openStaffStatusModal('${c._id}', '${c.complaint_id}', '${c.status}')">
              <i class="bi bi-pencil-square me-1"></i> Update
            </button>
          </div>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">${err.message}</td></tr>`;
  }
}

window.openStaffStatusModal = function (mongoId, complaintId, currentStatus) {
  document.getElementById('staff-modal-complaint-id').value = mongoId;
  document.getElementById('staff-modal-complaint-code').textContent = complaintId;

  const select = document.getElementById('staff-status-select');
  if (['In Progress', 'Resolved', 'Closed', 'Rejected'].includes(currentStatus)) {
    select.value = currentStatus;
  } else {
    select.value = 'In Progress';
  }
  document.getElementById('staff-remarks-input').value = '';

  const modal = new bootstrap.Modal(document.getElementById('staffStatusModal'));
  modal.show();
};

async function handleStaffStatusSubmit(e) {
  e.preventDefault();
  const complaintId = document.getElementById('staff-modal-complaint-id').value;
  const status = document.getElementById('staff-status-select').value;
  const remarks = document.getElementById('staff-remarks-input').value.trim();

  try {
    await API.updateStaffStatus(complaintId, status, remarks);
    bootstrap.Modal.getInstance(document.getElementById('staffStatusModal')).hide();
    alert('Progress updated and logged successfully!');
    await loadStaffComplaints();
  } catch (err) {
    alert('Error updating status: ' + err.message);
  }
}

window.openStaffDetails = async function (complaintId) {
  const modal = new bootstrap.Modal(document.getElementById('staffDetailsModal'));
  const modalBody = document.getElementById('staff-detail-modal-body');
  document.getElementById('staff-detail-modal-title').textContent = `Complaint ${complaintId}`;

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
          <p class="text-muted">${complaint.description}</p>
          <hr>
          <p class="mb-1"><strong>Citizen Name:</strong> ${complaint.user_id ? complaint.user_id.name : 'Citizen'}</p>
          <p class="mb-1"><strong>Location:</strong> ${complaint.location}</p>
          <p class="mb-1"><strong>Landmark:</strong> ${complaint.landmark || 'None'}</p>
          <p class="mb-1"><strong>Reported Date:</strong> ${UI.formatDate(complaint.created_at)}</p>
        </div>
        <div class="col-md-5 text-center">
          ${complaint.image ? `
            <img src="${complaint.image}" class="img-fluid rounded border shadow-sm" style="max-height: 240px; object-fit: cover;" alt="Problem Photo">
          ` : '<div class="p-4 bg-light border rounded text-muted">No photo attached by citizen</div>'}
        </div>
      </div>
      <hr>
      <h6 class="fw-bold mb-3">Timeline &amp; Previous Remarks</h6>
      <div class="timeline">
        ${updates.map(u => `
          <div class="timeline-item">
            <div class="timeline-dot active"></div>
            <div class="timeline-content">
              <div class="d-flex justify-content-between">
                <span>${UI.getStatusBadge(u.status)}</span>
                <span class="timeline-date">${UI.formatDate(u.updated_at)}</span>
              </div>
              <p class="mb-1 text-dark">${u.remarks}</p>
              <small class="text-muted">Updated by: ${u.staff_id ? u.staff_id.name : 'System'}</small>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    modalBody.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
};