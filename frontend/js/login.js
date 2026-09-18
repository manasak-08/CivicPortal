document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
  const submitBtn = document.getElementById('login-submit-btn');

  // Check URL params for session expiration
  const params = new URLSearchParams(window.location.search);
  if (params.get('expired')) {
    UI.showAlert('login-alert', 'Your session expired. Please sign in again.', 'warning');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing in...';

    try {
      const email = emailInput.value.trim();
      const password = passInput.value;

      const res = await API.login(email, password);

      UI.showAlert('login-alert', 'Login successful! Redirecting...', 'success');

      setTimeout(() => {
        const user = res.data.user;
        if (user.role === 'admin') {
          window.location.href = '/admin.html';
        } else if (user.role === 'staff') {
          window.location.href = '/staff.html';
        } else {
          window.location.href = '/dashboard.html';
        }
      }, 700);

    } catch (err) {
      UI.showAlert('login-alert', err.message || 'Invalid email or password.', 'danger');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i> Sign In';
    }
  });

  
  document.getElementById('quick-admin')?.addEventListener('click', () => {
    emailInput.value = 'admin@example.com';
    passInput.value = 'admin123';
  });
  document.getElementById('quick-staff')?.addEventListener('click', () => {
    emailInput.value = 'staff@example.com';
    passInput.value = 'staff123';
  });
  document.getElementById('quick-citizen')?.addEventListener('click', () => {
    emailInput.value = 'citizen@example.com';
    passInput.value = 'citizen123';
  });
});