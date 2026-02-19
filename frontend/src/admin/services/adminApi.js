import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

// Create axios instance for admin API
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Dashboard API
export const dashboardAPI = {
  getStats: () => adminApi.get('/admin/dashboard/stats'),
  getRecentOrders: () => adminApi.get('/admin/dashboard/recent-orders'),
  getSalesChart: (period = 'monthly') => adminApi.get(`/admin/dashboard/sales-chart?period=${period}`),
};

// Admin Products API (matches backend routes in admin.js)
export const adminProductsAPI = {
  getAll: (params) => adminApi.get('/admin/products', { params }),
  getById: (id) => adminApi.get(`/admin/products/${id}`),
  create: (data) => adminApi.post('/admin/products', data),
  update: (id, data) => adminApi.put(`/admin/products/${id}`, data),
  delete: (id) => adminApi.delete(`/admin/products/${id}`),
  updateStatus: (id, status) => adminApi.patch(`/admin/products/${id}/status`, { status }),
  bulkDelete: (ids) => adminApi.post('/admin/products/bulk-delete', { ids }),
};

// Admin Categories API
export const adminCategoriesAPI = {
  getAll: (params) => adminApi.get('/admin/categories', { params }),
  create: (data) => adminApi.post('/admin/categories', data),
  update: (id, data) => adminApi.put(`/admin/categories/${id}`, data),
  delete: (id) => adminApi.delete(`/admin/categories/${id}`),
  updateStatus: (id, status) => adminApi.patch(`/admin/categories/${id}/status`, { status }),
};

// Admin Users API
export const adminUsersAPI = {
  getAll: (params) => adminApi.get('/admin/users', { params }),
  getById: (id) => adminApi.get(`/admin/users/${id}`),
  toggleStatus: (id) => adminApi.patch(`/admin/users/${id}/toggle-status`),
  getUserOrders: (id, params) => adminApi.get(`/admin/users/${id}/orders`, { params }),
};

// Admin Orders API
export const adminOrdersAPI = {
  getAll: (params) => adminApi.get('/admin/orders', { params }),
  getById: (id) => adminApi.get(`/admin/orders/${id}`),
  updateStatus: (id, status) => adminApi.patch(`/admin/orders/${id}/status`, { status }),
  updatePaymentStatus: (id, status) => adminApi.patch(`/admin/orders/${id}/payment-status`, { status: String(status) }),
};

// Admin Reports API (sales, products, users; revenue/export not implemented on backend)
export const adminReportsAPI = {
  getSalesReport: (params) => adminApi.get('/admin/reports/sales', { params }),
  getProductReport: (params) => adminApi.get('/admin/reports/products', { params }),
  getUserReport: (params) => adminApi.get('/admin/reports/users', { params }),
};

// Admin Fabrics API
export const adminFabricsAPI = {
  getAll: (params) => adminApi.get('/admin/fabrics', { params }),
  create: (data) => adminApi.post('/admin/fabrics', data),
  update: (id, data) => adminApi.put(`/admin/fabrics/${id}`, data),
  delete: (id) => adminApi.delete(`/admin/fabrics/${id}`),
};

// Admin image upload (Cloudinary via backend)
export const adminUploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return adminApi.post('/admin/upload', formData);
  },
};

export default adminApi;
