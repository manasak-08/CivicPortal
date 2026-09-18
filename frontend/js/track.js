document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('track-form');
  const input = document.getElementById('track-id-input');

  // If ID present in URL (?id=CMP-2026-0001), auto-search
  const params = new URLSearchParams(window.location.search);
  const idFromUrl = params.get('id');
  if (idFromUrl) {
    input.value = idFromUrl;
    performTrack(idFromUrl);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = input.value.trim();
    if (id) {
      performTrack(id);
    }
  });
});

async function performTrack(complaintId) {
  const resultContainer = document.getElementById('tracking-result');
  const submitBtn = document.getElementById('track-submit-btn');

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
  document.getElementById('track-alert').innerHTML = '';

  try {
    const res = await API.trackComplaint(complaintId);
    const { complaint, updates } = res.data;

    renderTrackingData(complaint, updates);
    resultContainer.classList.remove('d-none');
    resultContainer.scrollIntoView({ behavior: 'smooth' });

  } catch (err) {
    resultContainer.classList.add('d-none');
    UI.showAlert('track-alert', err.message || `Complaint "${complaintId}" not found.`, 'danger');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Track';
  }
}

function renderTrackingData(complaint, updates) {
  document.getElementById('res-id').textContent = complaint.complaint_id;
  document.getElementById('res-category').innerHTML = UI.getCategoryBadge(complaint.category);
  document.getElementById('res-status').innerHTML = UI.getStatusBadge(complaint.status);
  document.getElementById('res-title').textContent = complaint.title;
  document.getElementById('res-description').textContent = complaint.description;
  document.getElementById('res-location').textContent = complaint.location;
  document.getElementById('res-landmark').textContent = complaint.landmark || 'N/A';
  document.getElementById('res-date').textContent = UI.formatDate(complaint.created_at);

  if (complaint.assigned_staff_id) {
    document.getElementById('res-staff').textContent = complaint.assigned_staff_id.name;
  } else {
    document.getElementById('res-staff').innerHTML = '<span class="text-muted">Awaiting Staff Assignment</span>';
  }

  const imgContainer = document.getElementById('res-image-container');
  if (complaint.image) {
    imgContainer.innerHTML = `
      <img src="${complaint.image}" class="img-fluid rounded-3 border shadow-sm" style="max-height: 250px; object-fit: cover;" alt="Problem Photo">
      <small class="text-muted d-block mt-2">Citizen Uploaded Photo</small>
    `;
  } else {
    imgContainer.innerHTML = `
      <div class="p-4 bg-light rounded-3 border text-muted">
        <i class="bi bi-camera-slash fs-1 d-block mb-1"></i>
        No photograph provided
      </div>
    `;
  }
  updateStepBar(complaint.status);


  const timelineEl = document.getElementById('timeline-container');
  if (updates && updates.length > 0) {
    timelineEl.innerHTML = updates.map((u, i) => `
      <div class="timeline-item">
        <div class="timeline-dot ${i === updates.length - 1 ? 'active' : ''}"></div>
        <div class="timeline-content">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="fw-bold">${UI.getStatusBadge(u.status)}</span>
            <span class="timeline-date">${UI.formatDate(u.updated_at)}</span>
          </div>
          <p class="mb-1 text-dark">${u.remarks}</p>
          <small class="text-muted"><i class="bi bi-person me-1"></i>Updated by: ${u.staff_id ? u.staff_id.name : 'System'}</small>
        </div>
      </div>
    `).join('');
  } else {
    timelineEl.innerHTML = '<p class="text-muted">No timeline updates recorded yet.</p>';
  }
}

function updateStepBar(currentStatus) {
  const steps = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
  const stepMap = {
    'Submitted': document.getElementById('step-submitted'),
    'Assigned': document.getElementById('step-assigned'),
    'In Progress': document.getElementById('step-inprogress'),
    'Resolved': document.getElementById('step-resolved'),
    'Closed': document.getElementById('step-closed')
  };

  Object.values(stepMap).forEach(el => {
    el.classList.remove('completed', 'current');
  });

  const currentIndex = steps.indexOf(currentStatus);

  if (currentStatus === 'Rejected') {

    document.getElementById('step-submitted').classList.add('completed');
    return;
  }

  if (currentIndex >= 0) {
    for (let i = 0; i < currentIndex; i++) {
      stepMap[steps[i]].classList.add('completed');
    }
    stepMap[steps[currentIndex]].classList.add('current');
  }
}