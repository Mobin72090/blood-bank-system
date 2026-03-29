const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  
  register: async (data) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Donors
  getDonors: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_URL}/donors?${params}`, { headers: getHeaders() });
    return res.json();
  },

  markAsDonated: async (id) => {
    const res = await fetch(`${API_URL}/donors/${id}/donate`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  updateAvailability: async (id, isAvailable) => {
    const res = await fetch(`${API_URL}/donors/${id}/availability`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ is_available: isAvailable })
    });
    return res.json();
  },

  // Inventory
  getInventory: async () => {
    const res = await fetch(`${API_URL}/inventory`, { headers: getHeaders() });
    return res.json();
  },

  // Requests
  getRequests: async (status = '') => {
    const res = await fetch(`${API_URL}/requests${status ? `?status=${status}` : ''}`, { headers: getHeaders() });
    return res.json();
  },

  createRequest: async (data) => {
    const res = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateRequestStatus: async (id, status) => {
    const res = await fetch(`${API_URL}/requests/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error("Failed to update status");
    return res.json();
  }
};
