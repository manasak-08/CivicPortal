let categoryChart = null;
let statusChart = null;
let monthlyChart = null;
let staffCache = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!UI.guardAuth('admin')) return;

  const user = API.getUser();
  if (user) {
    document.getElementById('admin-user-name').textContent = user.name;
  }

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
    API.removeToken();
    window.location.href = '/login.html';
  });

  document.getElementById('tab-dashboard')?.addEventListener('shown.bs.tab', loadAdminStats);
  document.getElementById('tab-complaints')?.addEventListener('shown.bs.tab', loadAdminComplaints);
  document.getElementById('tab-staff')?.addEventListener('shown.bs.tab', loadAdminStaff);
  document.getElementById('tab-citizens')?.addEventListener('shown.bs.tab', loadAdminCitizens);


  document.getElementById('admin-search-input')?.addEventListener('input', debounce(loadAdminComplaints, 300));
  document.getElementById('admin-filter-cat')?.addEventListener('change', loadAdminComplaints);
  document.getElementById('admin-filter-status')?.addEventListener('change', loadAdminComplaints);
  document.getElementById('admin-refresh-btn')?.addEventListener('click', () => {
    loadAdminStats();
    loadAdminComplaints();
  });


  document.getElementById('assign-form')?.addEventListener('submit', handleAssignSubmit);
  
  document.getElementById('status-form')?.addEventListener('submit', handleStatusSubmit);

  document.getElementById('add-staff-form')?.addEventListener('submit', handleAddStaffSubmit);


  await loadAdminStats();
  await cacheStaffList();
});

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

async function cacheStaffList() {
  try {
    const res = await API.getAdminStaff();
    staffCache = res.data.staff || [];
  } catch (err) {
    console.error('Error fetching staff cache:', err);
  }
}

async function loadAdminStats() {
  try {
    const res = await API.getAdminStats();
    const { counters, charts } = res.data;


    document.getElementById('admin-stat-total').textContent = counters.totalComplaints || 0;
    document.getElementById('admin-stat-pending').textContent = counters.pending || 0;
    document.getElementById('admin-stat-assigned').textContent = counters.assigned || 0;
    document.getElementById('admin-stat-progress').textContent = counters.inProgress || 0;
    document.getElementById('admin-stat-resolved').textContent = counters.resolved || 0;
    document.getElementById('admin-stat-closed').textContent = counters.closed || 0;
    document.getElementById('admin-stat-users').textContent = counters.totalUsers || 0;

   
    renderCategoryChart(charts.categoryCounts);
    renderStatusChart(charts.statusCounts);
    renderMonthlyChart(charts.monthly);

  } catch (err) {
    console.error('Error loading admin stats:', err);
  }
}

function renderCategoryChart(dataObj) {
  const ctx = document.getElementById('chartCategory').getContext('2d');
  if (categoryChart) categoryChart.destroy();

  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(dataObj),
      datasets: [{
        data: Object.values(dataObj),
        backgroundColor: ['#ffc107', '#0dcaf0', '#198754', '#dc3545'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12 } }
      }
    }
  });
}

function renderStatusChart(dataObj) {
  const ctx = document.getElementById('chartStatus').getContext('2d');
  if (statusChart) statusChart.destroy();

  statusChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(dataObj),
      datasets: [{
        label: 'Complaints',
        data: Object.values(dataObj),
        backgroundColor: ['#6c757d', '#ffc107', '#0dcaf0', '#fd7e14', '#198754', '#495057', '#dc3545']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });
}

function renderMonthlyChart(monthlyData) {
  const ctx = document.getElementById('chartMonthly').getContext('2d');
  if (monthlyChart) monthlyChart.destroy();

  monthlyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthlyData.labels,
      datasets: [{
        label: 'Monthly Submissions',
        data: monthlyData.data,
        borderColor: '#1e3c72',
        backgroundColor: 'rgba(30, 60, 114, 0.1)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });
}

async function loadAdminComplaints() {
  const tbody = document.getElementById('admin-complaints-tbody');
  const search = document.getElementById('admin-search-input')?.value.trim();
  const category = document.getElementById('admin-filter-cat')?.value;
  const status = document.getElementById('admin-filter-status')?.value;

  try {
    const res = await API.getAdminComplaints({ search, category, status });
    const complaints = res.data.complaints;

    if (!complaints || complaints.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center py-5 text-muted">No complaints found.</td></tr>';
      return;
    }

    tbody.innerHTML = complaints.map(c => `
      <tr>
        <td class="ps-3 fw-bold text-primary">${c.complaint_id}</td>
        <td>
          <div class="fw-bold">${c.user_id ? c.user_id.name : 'Unknown Citizen'}</div>
          <small class="text-muted">${c.user_id ? c.user_id.email : ''}</small>
        </td>
        <td>
          ${UI.getCategoryBadge(c.category)}
          <div class="small fw-semibold mt-1 text-truncate" style="max-width: 200px;">${c.title}</div>
        </td>
        <td><small>${c.location}</small></td>
        <td>
          ${c.assigned_staff_id ? `
            <span class="badge bg-light text-dark border">
              <i class="bi bi-person-check text-success me-1"></i>${c.assigned_staff_id.name}
            </span>
          ` : '<span class="badge bg-secondary">Unassigned</span>'}
        </td>
        <td>${UI.getStatusBadge(c.status)}</td>
        <td><small class="text-muted">${UI.formatDate(c.created_at).split(',')[0]}</small></td>
        <td class="text-end pe-3">
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              Actions
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow">
              <li><a class="dropdown-item" href="#" onclick="openAdminDetails('${c.complaint_id}')"><i class="bi bi-eye text-primary me-2"></i> View Details</a></li>
              <li><a class="dropdown-item" href="#" onclick="openAssignModal('${c._id}', '${c.complaint_id}')"><i class="bi bi-person-plus text-info me-2"></i> Assign Staff</a></li>
              <li><a class="dropdown-item" href="#" onclick="openStatusModal('${c._id}', '${c.complaint_id}', '${c.status}')"><i class="bi bi-arrow-repeat text-warning me-2"></i> Change Status</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-danger" href="#" onclick="deleteComplaint('${c._id}', '${c.complaint_id}')"><i class="bi bi-trash me-2"></i> Delete Complaint</a></li>
            </ul>
          </div>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-4">${err.message}</td></tr>`;
  }
}

// Assign Modal
window.openAssignModal = function (mongoId, complaintId) {
  document.getElementById('assign-complaint-id').value = mongoId;
  document.getElementById('assign-complaint-code').textContent = complaintId;

  const select = document.getElementById('assign-staff-select');
  if (staffCache.length === 0) {
    select.innerHTML = '<option disabled>No staff available. Please add staff first.</option>';
  } else {
    select.innerHTML = staffCache.map(s => {
      const uId = s.user_id?._id || s.user_id;
      return `<option value="${uId}">${s.name} (${s.department}) - ${s.phone}</option>`;
    }).join('');
  }

  const modal = new bootstrap.Modal(document.getElementById('assignModal'));
  modal.show();
};

async function handleAssignSubmit(e) {
  e.preventDefault();
  const complaintId = document.getElementById('assign-complaint-id').value;
  const staff_id = document.getElementById('assign-staff-select').value;
  const remarks = document.getElementById('assign-remarks').value.trim();

  try {
    await API.assignStaff(complaintId, staff_id, remarks);
    bootstrap.Modal.getInstance(document.getElementById('assignModal')).hide();
    alert('Staff assigned successfully!');
    loadAdminComplaints();
    loadAdminStats();
  } catch (err) {
    alert('Failed to assign staff: ' + err.message);
  }
}

// Status Modal
window.openStatusModal = function (mongoId, complaintId, currentStatus) {
  document.getElementById('status-complaint-id').value = mongoId;
  document.getElementById('status-complaint-code').textContent = complaintId;
  document.getElementById('status-select').value = currentStatus;
  document.getElementById('status-remarks').value = '';

  const modal = new bootstrap.Modal(document.getElementById('statusModal'));
  modal.show();
};

async function handleStatusSubmit(e) {
  e.preventDefault();
  const complaintId = document.getElementById('status-complaint-id').value;
  const status = document.getElementById('status-select').value;
  const remarks = document.getElementById('status-remarks').value.trim();

  try {
    await API.updateAdminStatus(complaintId, status, remarks);
    bootstrap.Modal.getInstance(document.getElementById('statusModal')).hide();
    alert('Status updated successfully!');
    loadAdminComplaints();
    loadAdminStats();
  } catch (err) {
    alert('Failed to update status: ' + err.message);
  }
}

window.deleteComplaint = async function (mongoId, complaintId) {
  if (!confirm(`Are you sure you want to permanently delete complaint "${complaintId}" and its audit history? This action cannot be undone.`)) {
    return;
  }

  try {
    await API.deleteComplaint(mongoId);
    alert(`Complaint ${complaintId} deleted.`);
    loadAdminComplaints();
    loadAdminStats();
  } catch (err) {
    alert('Error deleting complaint: ' + err.message);
  }
};
window.openAdminDetails = async function (complaintId) {
  const modal = new bootstrap.Modal(document.getElementById('adminDetailsModal'));
  const modalBody = document.getElementById('admin-modal-body');
  document.getElementById('admin-modal-title').textContent = `Complaint ${complaintId}`;

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
          <p class="mb-1"><strong>Citizen:</strong> ${complaint.user_id ? complaint.user_id.name + ' (' + complaint.user_id.email + ')' : 'N/A'}</p>
          <p class="mb-1"><strong>Location:</strong> ${complaint.location}</p>
          <p class="mb-1"><strong>Landmark:</strong> ${complaint.landmark || 'None'}</p>
          <p class="mb-1"><strong>Assigned Staff:</strong> ${complaint.assigned_staff_id ? complaint.assigned_staff_id.name : 'Unassigned'}</p>
          <p class="mb-1"><strong>Registered:</strong> ${UI.formatDate(complaint.created_at)}</p>
        </div>
        <div class="col-md-5 text-center">
          ${complaint.image ? `
            <img src="${complaint.image}" class="img-fluid rounded border shadow-sm" style="max-height: 240px; object-fit: cover;" alt="Problem Photo">
          ` : '<div class="p-4 bg-light border rounded text-muted">No photo uploaded</div>'}
        </div>
      </div>
      <hr>
      <h6 class="fw-bold mb-3">Audit Log &amp; Timeline</h6>
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
              <small class="text-muted">By: ${u.staff_id ? u.staff_id.name : 'System'}</small>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    modalBody.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
};
async function loadAdminStaff() {
  const tbody = document.getElementById('admin-staff-tbody');
  try {
    const res = await API.getAdminStaff();
    const staff = res.data.staff;
    staffCache = staff;

    if (!staff || staff.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No staff members created yet.</td></tr>';
      return;
    }

    tbody.innerHTML = staff.map(s => `
      <tr>
        <td class="ps-3 fw-bold">${s.name}</td>
        <td>${s.email}</td>
        <td>${s.phone}</td>
        <td><span class="badge bg-info text-dark">${s.department}</span></td>
        <td><small class="text-muted">${UI.formatDate(s.created_at).split(',')[0]}</small></td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">${err.message}</td></tr>`;
  }
}

async function handleAddStaffSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('new-staff-name').value.trim();
  const email = document.getElementById('new-staff-email').value.trim();
  const phone = document.getElementById('new-staff-phone').value.trim();
  const department = document.getElementById('new-staff-dept').value;
  const password = document.getElementById('new-staff-password').value;

  try {
    await API.createStaff({ name, email, phone, department, password });
    bootstrap.Modal.getInstance(document.getElementById('addStaffModal')).hide();
    alert('Staff member created successfully!');
    document.getElementById('add-staff-form').reset();
    await loadAdminStaff();
  } catch (err) {
    UI.showAlert('add-staff-alert', err.message, 'danger');
  }
}

async function loadAdminCitizens() {
  const tbody = document.getElementById('admin-users-tbody');
  try {
    const res = await API.getAdminUsers();
    const users = res.data.users.filter(u => u.role === 'citizen');

    if (!users || users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No citizens registered yet.</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(u => `
      <tr>
        <td class="ps-3 fw-bold">${u.name}</td>
        <td>${u.email}</td>
        <td>${u.phone}</td>
        <td>${u.address}</td>
        <td><span class="badge bg-secondary">${u.role}</span></td>
        <td><small class="text-muted">${UI.formatDate(u.created_at).split(',')[0]}</small></td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">${err.message}</td></tr>`;
  }
}