document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('staff-login-form');
  const emailInput = document.getElementById('staff-email');
  const passInput = document.getElementById('staff-password');
  const submitBtn = document.getElementById('staff-submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Authenticating...';

    try {
      const email = emailInput.value.trim();
      const password = passInput.value;

      const res = await API.staffLogin(email, password);

      UI.showAlert('staff-login-alert', 'Authentication successful! Redirecting to Staff Dashboard...', 'success');

      setTimeout(() => {
        window.location.href = '/staff.html';
      }, 700);

    } catch (err) {
      UI.showAlert('staff-login-alert', err.message || 'Invalid staff credentials or access denied.', 'danger');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i> Access Staff Dashboard';
    }
  });

  // 1-Click Demo Buttons
  document.getElementById('btn-staff-lighting')?.addEventListener('click', () => {
    emailInput.value = 'staff@example.com';
    passInput.value = 'staff123';
  });
  document.getElementById('btn-staff-water')?.addEventListener('click', () => {
    emailInput.value = 'water_dept@example.com';
    passInput.value = 'staff123';
  });
  document.getElementById('btn-staff-sanitation')?.addEventListener('click', () => {
    emailInput.value = 'clean_dept@example.com';
    passInput.value = 'staff123';
  });
});