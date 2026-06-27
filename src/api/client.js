import { ENV } from '../config/environment';

const API_URL = ENV.API_URL;

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP ${response.status}`);
  }
  return data;
};

const buildUrl = (endpoint, params = {}) => {
  const url = new URL(`${API_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
};

export const authAPI = {
  register: async (userData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },
  login: async (credentials) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },
  logout: async (refreshToken, token) => {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ refreshToken }),
    });
    return handleResponse(res);
  },
  refreshToken: async (refreshToken) => {
    const res = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    return handleResponse(res);
  },
  forgotPassword: async (email) => {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(res);
  },
  resetPassword: async (token, password) => {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    return handleResponse(res);
  },
  getMe: async (token) => {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(res);
  },
};

export const profileAPI = {
  browse: async (filters = {}, token) => {
    const url = buildUrl('/profiles', filters);
    const res = await fetch(url, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    return handleResponse(res);
  },
  getById: async (id, token) => {
    const res = await fetch(`${API_URL}/profiles/${id}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    return handleResponse(res);
  },
  update: async (id, data, token) => {
    const res = await fetch(`${API_URL}/profiles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  toggleFavorite: async (id, token) => {
    const res = await fetch(`${API_URL}/profiles/${id}/favorite`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(res);
  },
  recordView: async (id, token) => {
    const res = await fetch(`${API_URL}/profiles/${id}/view`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    return handleResponse(res);
  },
};

export const bookingAPI = {
  create: async (data, token) => {
    const res = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  getMyBookings: async (filters = {}, token) => {
    const url = buildUrl('/bookings', filters);
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(res);
  },
  getById: async (id, token) => {
    const res = await fetch(`${API_URL}/bookings/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(res);
  },
  updateStatus: async (id, status, cancellationReason, token) => {
    const res = await fetch(`${API_URL}/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status, ...(cancellationReason ? { cancellationReason } : {}) }),
    });
    return handleResponse(res);
  },
};

export const reviewAPI = {
  create: async (data, token) => {
    const res = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  getProfileReviews: async (profileId, page = 1, limit = 10, token) => {
    const url = buildUrl(`/reviews/${profileId}`, { page, limit });
    const res = await fetch(url, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    return handleResponse(res);
  },
  getById: async (id, token) => {
    const res = await fetch(`${API_URL}/reviews/${id}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    return handleResponse(res);
  },
  update: async (id, data, token) => {
    const res = await fetch(`${API_URL}/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  delete: async (id, token) => {
    const res = await fetch(`${API_URL}/reviews/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(res);
  },
  respond: async (id, reply, token) => {
    const res = await fetch(`${API_URL}/reviews/${id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ reply }),
    });
    return handleResponse(res);
  },
  helpful: async (id, token) => {
    const res = await fetch(`${API_URL}/reviews/${id}/helpful`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(res);
  },
};

export const messageAPI = {
  getConversations: async (token) => {
    const res = await fetch(`${API_URL}/messages`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(res);
  },
  send: async (data, token) => {
    const res = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  markConversationRead: async (otherUserId, token) => {
    const res = await fetch(`${API_URL}/messages/read`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ otherUserId }),
    });
    return handleResponse(res);
  },
};

export const userAPI = {
  update: async (data, token) => {
    const res = await fetch(`${API_URL}/users/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

export const notificationAPI = {
  get: async (page = 1, limit = 20, token) => {
    const url = buildUrl('/notifications', { page, limit });
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(res);
  },
  markRead: async (id, token) => {
    const res = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(res);
  },
  markAllRead: async (token) => {
    const res = await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(res);
  },
  delete: async (id, token) => {
    const res = await fetch(`${API_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(res);
  },
  getUnreadCount: async (token) => {
    const res = await fetch(`${API_URL}/notifications/unread-count`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(res);
  },
};

export const adminAPI = {
  getUsers: async (filters = {}, token) => {
    const url = buildUrl('/admin/users', filters);
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    return handleResponse(res);
  },
  getUser: async (id, token) => {
    const res = await fetch(`${API_URL}/admin/users/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(res);
  },
  toggleUserStatus: async (id, token) => {
    const res = await fetch(`${API_URL}/admin/users/${id}/toggle-status`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(res);
  },
  getStats: async (token) => {
    const res = await fetch(`${API_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(res);
  },
};

export const paymentAPI = {
  createIntent: async (data, token) => {
    const res = await fetch(`${API_URL}/payments/create-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  confirm: async (bookingId, token) => {
    const res = await fetch(`${API_URL}/payments/${bookingId}/confirm`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(res);
  },
};

const api = {
  auth: authAPI,
  profile: profileAPI,
  booking: bookingAPI,
  review: reviewAPI,
  message: messageAPI,
  user: userAPI,
  notification: notificationAPI,
  admin: adminAPI,
  payment: paymentAPI,
};

export default api;
