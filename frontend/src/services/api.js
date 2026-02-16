import axios from 'axios';
import { API_BASE_URL, removeToken } from '../config/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Determine if it's a 401 and NOT a guest-allowed route
    // Actually, guests might get 401 if logic fails, but with optionalProtect they shouldn't.
    // However, if token is invalid, backend might return 401. 
    // Let's keep 401 redirect BUT maybe exclude specific scenarios if needed.
    // Ideally, with optionalProtect, guest requests don't 401. 
    // Users with bad token might.
    if (error.response?.status === 401) {
      // Check if it is a cart route - we don't want to redirect guests if they just have no access
      // But optionalProtect should return 200 even for guests.
      // If we get 401, it means strictly "Unauthorized" which shouldn't happen for public routes.
      // So standard behavior is fine, IF backend is correct.
      // However, if we receive 401, we remove token.
      removeToken();
      // Only redirect if NOT on public pages? No, global logout is safer.
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Helper for Guest Cart
const getGuestId = () => {
  let guestId = localStorage.getItem('guestId');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    localStorage.setItem('guestId', guestId);
  }
  return guestId;
};

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  googleLogin: (data) => api.post('/auth/google', data)
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories/list')
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart', { params: { guestId: getGuestId() } }),
  add: (data) => api.post('/cart', { ...data, guestId: getGuestId() }),
  update: (itemId, data) => api.put(`/cart/${itemId}`, { ...data, guestId: getGuestId() }),
  remove: (itemId) => api.delete(`/cart/${itemId}`, { params: { guestId: getGuestId() } }),
  saveForLater: (itemId) => api.post(`/cart/save-for-later/${itemId}`, { guestId: getGuestId() }),
  moveToCart: (itemId) => api.post(`/cart/move-to-cart/${itemId}`, { guestId: getGuestId() }),
  clear: () => api.delete('/cart/clear', { params: { guestId: getGuestId() } })
};

// Wishlist API
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (data) => api.post('/wishlist', data),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
  check: (productId) => api.post(`/wishlist/check/${productId}`)
};

// Orders API
export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getMyOrders: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  track: (orderNumber) => api.get(`/orders/track/${orderNumber}`)
};

// Addresses API
export const addressesAPI = {
  getAll: () => api.get('/addresses'),
  getById: (id) => api.get(`/addresses/${id}`),
  create: (data) => api.post('/addresses', data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  delete: (id) => api.delete(`/addresses/${id}`)
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getOrders: (params) => api.get('/users/orders', { params })
};

// Payment API
export const paymentAPI = {
  getKey: () => api.get('/payment/key'),
  createOrder: (data) => api.post('/payment/create-order', data),
  verify: (data) => api.post('/payment/verify', data)
};

// Fabrics API
export const fabricsAPI = {
  getAll: () => api.get('/fabrics')
};

// Categories API (public - for navbar)
export const categoriesAPI = {
  getNavbarCategories: () => api.get('/categories')
};

export default api;
