import axios from 'axios';

// Create Axios Instance with proxy URL configurations
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Request Interceptor:
// Automatically reads JWT token from localStorage and appends it to Authorization headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const apiService = {
  // --- 1. Authentication Services ---
  
  register: async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Registration failed. Please try again.';
    }
  },

  login: async (username_or_email, password) => {
    try {
      const response = await api.post('/auth/login', { username_or_email, password });
      // Store JWT token securely in localStorage
      if (response.data.access_token) {
        localStorage.setItem('jwt_token', response.data.access_token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Invalid login credentials.';
    }
  },

  logout: () => {
    localStorage.removeItem('jwt_token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('jwt_token');
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Failed to authenticate profile.';
    }
  },

  // --- 2. Car Price Predictions Services ---

  predictPrice: async (carData) => {
    try {
      const response = await api.post('/predict/', carData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Valuation inference failed.';
    }
  },

  // --- 3. Prediction Logs & History Services ---

  getPersonalHistory: async (skip = 0, limit = 20) => {
    try {
      const response = await api.get('/history/all', {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Failed to retrieve history logs.';
    }
  },

  getAnalytics: async () => {
    try {
      const response = await api.get('/analytics');
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Failed to compile visual parameters.';
    }
  }
};

export default apiService;
