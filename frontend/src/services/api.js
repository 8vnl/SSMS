import axios from 'axios';

// Use relative URL - this will work for both local and external access
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['Content-Type'] = 'application/json';
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.code === 'ECONNREFUSED') {
      error.message = 'Cannot connect to server. Please check your connection.';
    } else if (error.response?.status === 401) {
      error.message = 'Invalid credentials';
    } else if (error.response?.status === 400) {
      error.message = error.response.data?.message || 'Bad request';
    } else if (!error.response) {
      error.message = 'Network error - cannot reach server';
    }
    return Promise.reject(error);
  }
);

export default api;
