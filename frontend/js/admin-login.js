document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('admin-login-form');
  const emailInput = document.getElementById('admin-email');
  const passInput = document.getElementById('admin-password');
  const submitBtn = document.getElementById('admin-submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Verifying Clearance...';

    try {
      const email = emailInput.value.trim();
      const password = passInput.value;

      const res = await API.adminLogin(email, password);

      UI.showAlert('admin-login-alert', 'Clearance verified! Opening Admin Command Center...', 'success');

      setTimeout(() => {
        window.location.href = '/admin.html';
      }, 700);

    } catch (err) {
      UI.showAlert('admin-login-alert', err.message || 'Access Denied: Invalid administrator credentials.', 'danger');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-unlock me-2"></i> Authenticate &amp; Open Command Center';
    }
  });

  // 1-Click Demo Button
  document.getElementById('btn-admin-demo')?.addEventListener('click', () => {
    emailInput.value = 'admin@example.com';
    passInput.value = 'admin123';
  });
});