const API_BASE = '/api';

const API = {

  getToken() {
    return localStorage.getItem('token');
  },
  setToken(token) {
    localStorage.setItem('token', token);
  },
  removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getUser() {
    const raw = localStorage.getItem('user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },
  isLoggedIn() {
    return !!this.getToken();
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = options.headers || {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
          this.removeToken();
          window.location.href = '/login.html?expired=true';
        }
        throw new Error(data.message || 'Request failed with status ' + response.status);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  },

  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.data && res.data.token) {
      this.setToken(res.data.token);
      this.setUser(res.data.user);
    }
    return res;
  },

  async staffLogin(email, password) {
    const res = await this.request('/staff/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.data && res.data.token) {
      this.setToken(res.data.token);
      this.setUser(res.data.user);
    }
    return res;
  },

  async adminLogin(email, password) {
    const res = await this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.data && res.data.token) {
      this.setToken(res.data.token);
      this.setUser(res.data.user);
    }
    return res;
  },

  async register(userData) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (res.data && res.data.token) {
      this.setToken(res.data.token);
      this.setUser(res.data.user);
    }
    return res;
  },

  async getMe() {
    return await this.request('/auth/me');
  },

  // Complaint Endpoints
  async createComplaint(formData) {
    return await this.request('/complaints', {
      method: 'POST',
      body: formData
    });
  },

  async getCitizenComplaints(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await this.request(`/complaints${query ? '?' + query : ''}`);
  },

  async getComplaintById(id) {
    return await this.request(`/complaints/${id}`);
  },

  async trackComplaint(complaintId) {
    return await this.request(`/complaints/track/${encodeURIComponent(complaintId)}`);
  },

  // Admin Endpoints
  async getAdminStats() {
    return await this.request('/admin/stats');
  },

  async getAdminComplaints(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await this.request(`/admin/complaints${query ? '?' + query : ''}`);
  },

  async getAdminUsers() {
    return await this.request('/admin/users');
  },

  async getAdminStaff() {
    return await this.request('/admin/staff');
  },

  async createStaff(data) {
    return await this.request('/admin/staff', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async assignStaff(complaintId, staff_id, remarks) {
    return await this.request(`/admin/complaints/${complaintId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ staff_id, remarks })
    });
  },

  async updateAdminStatus(complaintId, status, remarks) {
    return await this.request(`/admin/complaints/${complaintId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, remarks })
    });
  },

  async deleteComplaint(complaintId) {
    return await this.request(`/admin/complaints/${complaintId}`, {
      method: 'DELETE'
    });
  },

  async getStaffComplaints(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await this.request(`/staff/complaints${query ? '?' + query : ''}`);
  },

  async updateStaffStatus(complaintId, status, remarks) {
    return await this.request(`/staff/complaints/${complaintId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, remarks })
    });
  }
};
const UI = {
  showAlert(containerId, message, type = 'danger') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
  },

  formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  getStatusBadge(status) {
    const clean = (status || 'Submitted').toLowerCase().replace(/\s+/g, '-');
    return `<span class="badge-status badge-status-${clean}">● ${status || 'Submitted'}</span>`;
  },

  getCategoryBadge(category) {
    let icon = '📌';
    if (category === 'Street Light') icon = '💡';
    if (category === 'Water Pipe Leakage') icon = '💧';
    if (category === 'Rain Water Drainage') icon = '🌧️';
    if (category === 'Roadside Cleaning') icon = '🧹';
    return `<span class="badge-category">${icon} ${category}</span>`;
  },

  setupNavbar() {
    const user = API.getUser();
    const navContainer = document.getElementById('navbar-auth-links');
    if (!navContainer) return;

    if (user) {
      let dashboardUrl = '/dashboard.html';
      if (user.role === 'admin') dashboardUrl = '/admin.html';
      if (user.role === 'staff') dashboardUrl = '/staff.html';

      navContainer.innerHTML = `
        <li class="nav-item">
          <a class="nav-link" href="${dashboardUrl}">
            <i class="bi bi-speedometer2 me-1"></i> Dashboard (${user.name.split(' ')[0]})
          </a>
        </li>
        <li class="nav-item">
          <button class="btn btn-outline-light btn-sm ms-2" id="logout-btn">
            <i class="bi bi-box-arrow-right me-1"></i> Logout
          </button>
        </li>
      `;

      document.getElementById('logout-btn')?.addEventListener('click', () => {
        API.removeToken();
        window.location.href = '/login.html';
      });
    } else {
      navContainer.innerHTML = `
        <li class="nav-item">
          <a class="nav-link" href="/login.html"><i class="bi bi-box-arrow-in-right me-1"></i> Login</a>
        </li>
        <li class="nav-item">
          <a class="btn btn-warning btn-sm ms-2 font-weight-bold text-dark" href="/register.html">
            <i class="bi bi-person-plus me-1"></i> Register
          </a>
        </li>
      `;
    }
  },

  guardAuth(requiredRole = null) {
    const user = API.getUser();
    if (!API.isLoggedIn() || !user) {
      if (requiredRole === 'admin') {
        window.location.href = '/admin-login.html';
      } else if (requiredRole === 'staff') {
        window.location.href = '/staff-login.html';
      } else {
        window.location.href = '/login.html';
      }
      return false;
    }

    if (requiredRole && user.role !== requiredRole) {
      if (requiredRole === 'admin') {
        alert('Access Denied: Only administrators can access this page.');
        window.location.href = '/admin-login.html';
        return false;
      }
      if (requiredRole === 'staff') {
        alert('Access Denied: Only staff members can access this page.');
        window.location.href = '/staff-login.html';
        return false;
      }
      if (requiredRole === 'citizen') {
        window.location.href = '/login.html';
        return false;
      }
    }
    return true;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  UI.setupNavbar();
});