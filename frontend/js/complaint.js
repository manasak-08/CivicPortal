document.addEventListener('DOMContentLoaded', () => {
  if (!UI.guardAuth()) return;

  const form = document.getElementById('complaint-form');
  const fileInput = document.getElementById('image');
  const dropzone = document.getElementById('dropzone');
  const previewContainer = document.getElementById('image-preview-container');
  const previewImg = document.getElementById('preview-img');
  const removeImgBtn = document.getElementById('remove-img-btn');
  const submitBtn = document.getElementById('submit-complaint-btn');

  
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('category');
  if (catParam) {
    const select = document.getElementById('category');
    for (let opt of select.options) {
      if (opt.value.toLowerCase() === catParam.toLowerCase()) {
        opt.selected = true;
        break;
      }
    }
  }
  dropzone.addEventListener('click', () => fileInput.click());

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('border-primary');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('border-primary');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      fileInput.files = e.dataTransfer.files;
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) {
      handleFileSelected(fileInput.files[0]);
    }
  });

  function handleFileSelected(file) {
    if (!file.type.match('image.*')) {
      alert('Only image files (JPG, PNG, WEBP) are allowed.');
      fileInput.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      fileInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewContainer.classList.remove('d-none');
      dropzone.classList.add('d-none');
    };
    reader.readAsDataURL(file);
  }

  removeImgBtn.addEventListener('click', () => {
    fileInput.value = '';
    previewImg.src = '';
    previewContainer.classList.add('d-none');
    dropzone.classList.remove('d-none');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Registering complaint...';

    try {
      const formData = new FormData(form);
      const res = await API.createComplaint(formData);

      const complaintId = res.data.complaint_id;

    
      document.getElementById('success-complaint-id').textContent = complaintId;
      document.getElementById('btn-track-now').href = `/track-complaint.html?id=${complaintId}`;

      const successModal = new bootstrap.Modal(document.getElementById('successModal'));
      successModal.show();

    } catch (err) {
      UI.showAlert('complaint-alert', err.message || 'Failed to submit complaint. Please check your inputs.', 'danger');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-send-check me-2"></i> Submit Complaint';
    }
  });
});