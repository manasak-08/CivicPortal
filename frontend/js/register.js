document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const submitBtn = document.getElementById('register-submit-btn');

  if (!form) {
    console.error('register-form not found');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const phone = document.getElementById('phone')?.value.trim() || '';
    const address = document.getElementById('address')?.value.trim() || '';

    // Get all password inputs
    const passwordInputs = form.querySelectorAll('input[type="password"]');

    console.log('Password fields found:', passwordInputs.length);

    if (passwordInputs.length < 2) {
      UI.showAlert(
        'register-alert',
        'Password fields were not found correctly.',
        'danger'
      );
      return;
    }

    const password = (passwordInputs[0].value || '').trim();
    const confirmPassword = (passwordInputs[1].value || '').trim();

    console.log('Password length:', password.length);
    console.log('Confirm Password length:', confirmPassword.length);

    // Compare passwords
    if (password !== confirmPassword) {
      UI.showAlert(
        'register-alert',
        'Passwords do not match! Please check and try again.',
        'warning'
      );
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Creating account...';

    try {
      await API.register({
        name,
        email,
        phone,
        address,
        password,
        confirmPassword,
        role: 'citizen'
      });

      UI.showAlert(
        'register-alert',
        'Registration successful! Redirecting to dashboard...',
        'success'
      );

      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 800);

    } catch (err) {
      console.error('Registration error:', err);

      UI.showAlert(
        'register-alert',
        err.message || 'Registration failed. Please check your information.',
        'danger'
      );

      submitBtn.disabled = false;
      submitBtn.innerHTML =
        '<i class="bi bi-person-check me-2"></i> Register Account';
    }
  });
});