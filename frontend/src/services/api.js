const API_BASE = import.meta.env.VITE_API_URL + '/api';
/**
 * Helper to fetch with automatically injected JWT token
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('she_can_admin_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    // If the token is invalid or expired (401 or 403), auto-logout
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('she_can_admin_token');
      localStorage.removeItem('she_can_admin_user');
      // Dispatch a storage event so App.jsx can respond and update state
      window.dispatchEvent(new Event('auth-change'));
    }
    
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const apiService = {
  // Public - Submit contact form
  async submitContact(name, email, message) {
    return request('/contact', {
      method: 'POST',
      body: JSON.stringify({ name, email, message })
    });
  },

  // Auth - Login Admin
  async login(username, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    if (data.token) {
      localStorage.setItem('she_can_admin_token', data.token);
      localStorage.setItem('she_can_admin_user', JSON.stringify(data.admin));
      window.dispatchEvent(new Event('auth-change'));
    }

    return data;
  },

  // Auth - Logout Admin
  logout() {
    localStorage.removeItem('she_can_admin_token');
    localStorage.removeItem('she_can_admin_user');
    window.dispatchEvent(new Event('auth-change'));
  },

  // Auth - Check if session token is still valid
  async verifySession() {
    try {
      const data = await request('/auth/verify', { method: 'GET' });
      return data.status === 'success';
    } catch (error) {
      console.warn('Session verification failed, logging out:', error.message);
      return false;
    }
  },

  // Admin - Fetch contact forms
  async getSubmissions(search = '') {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`/contact${query}`, { method: 'GET' });
  },

  // Admin - Delete submission
  async deleteSubmission(id) {
    return request(`/contact/${id}`, { method: 'DELETE' });
  },

  // Auth helper - get authenticated user details
  getCurrentUser() {
    const userStr = localStorage.getItem('she_can_admin_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  // Auth helper - check if authenticated (quick local check)
  isAuthenticated() {
    return !!localStorage.getItem('she_can_admin_token');
  }
};
