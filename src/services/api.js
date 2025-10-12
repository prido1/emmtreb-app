import axios from 'axios';

const API_BASE = 'https://sathub.emmtreb.com';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage and redirect to login
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      window.location.href = '/';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => apiClient.post('/api/admin/login', credentials),
  getProfile: () => apiClient.get('/api/admin/profile'),
  updateProfile: (data) => apiClient.put('/api/admin/profile', data),
  changePassword: (data) => apiClient.post('/api/admin/change-password', data),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => apiClient.get('/api/admin/dashboard'),
};

// Orders API
export const ordersAPI = {
  getAll: (params) => apiClient.get('/api/orders/admin/all', { params }),
  getById: (id) => apiClient.get(`/api/orders/${id}`),
  activate: (id, data) => apiClient.patch(`/api/orders/${id}/process`, { action: 'activate', ...data }),
  decline: (id, data) => apiClient.patch(`/api/orders/${id}/process`, { action: 'decline', ...data }),
  wrongSerial: (id, data) => apiClient.patch(`/api/orders/${id}/process`, { action: 'wrong_serial', ...data }),
  getStats: (params) => apiClient.get('/api/orders/admin/stats', { params }),
};

// Products API
export const productsAPI = {
  getAll: () => apiClient.get('/api/products'),
  getById: (id) => apiClient.get(`/api/products/${id}`),
  create: (data) => apiClient.post('/api/products', data),
  update: (id, data) => apiClient.put(`/api/products/${id}`, data),
  delete: (id) => apiClient.delete(`/api/products/${id}`),
  updateStock: (id, data) => apiClient.patch(`/api/products/${id}/stock`, data),
  getStats: () => apiClient.get('/api/products/meta/stats'),
};

// Customers API
export const customersAPI = {
  getAll: (params) => apiClient.get('/api/admin/customers', { params }),
  getById: (id) => apiClient.get(`/api/admin/customers/${id}`),
  update: (id, data) => apiClient.patch(`/api/admin/customers/${id}`, data),
  getStats: () => apiClient.get('/api/admin/customers/stats'),
};

// Payments API
export const paymentsAPI = {
  getAll: (params) => apiClient.get('/api/payments/admin/all', { params }),
  getById: (id) => apiClient.get(`/api/payments/${id}`),
  confirmPaid: (id, data) => apiClient.post(`/api/payments/admin/${id}/confirm-paid`, data),
  refund: (id, data) => apiClient.post(`/api/payments/admin/${id}/refund`, data),
  updateStatus: (id, data) => apiClient.patch(`/api/payments/admin/${id}/status`, data),
  getStats: (params) => apiClient.get('/api/payments/admin/stats', { params }),
};

// Wallets API
export const walletsAPI = {
  getAll: (params) => apiClient.get('/api/wallets/admin/all', { params }),
  getById: (customerId) => apiClient.get(`/api/wallets/admin/${customerId}`),
  addBalance: (customerId, data) => apiClient.post(`/api/wallets/admin/${customerId}/add-funds`, data),
  freeze: (customerId, data) => apiClient.patch(`/api/wallets/admin/${customerId}/freeze`, data),
  getStats: () => apiClient.get('/api/wallets/admin/stats'),
};

// Reports API
export const reportsAPI = {
  get: (type, params) => {
    // Build query string
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/api/admin/reports/${type}${queryParams ? `?${queryParams}` : ''}`);
  },
};

// Admin Management API
export const adminAPI = {
  getAll: (params) => apiClient.get('/api/admin/admins', { params }),
  getById: (id) => apiClient.get(`/api/admin/admins/${id}`),
  create: (data) => apiClient.post('/api/admin/admins', data),
  update: (id, data) => apiClient.put(`/api/admin/admins/${id}`, data),
  delete: (id) => apiClient.delete(`/api/admin/admins/${id}`),
  getRoles: () => apiClient.get('/api/admin/roles'),
};

export default apiClient;
