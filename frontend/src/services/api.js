import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
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
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/me'),
  updateUserRiskScore: (userId, action) => api.put('/user/risk-score', { userId, action }),
  checkAccountRestrictions: (userId) => api.get('/user/restrictions'),
  getAuditLogs: () => api.get('/user/audit-logs'),
};

// Wallet API
export const walletAPI = {
  getWallet: () => api.get('/wallet'),
  fundWallet: (amount) => api.post('/wallet/fund', { amount }),
  withdrawWallet: (amount) => api.post('/wallet/withdraw', { amount }),
  getTransactions: () => api.get('/wallet/transactions'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
