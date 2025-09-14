// api.js
import axios from 'axios';

// Use environment variable or fallback to your Railway URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://eld-log-generator-production.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to handle errors
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response);
    return Promise.reject(error);
  }
);

export const calculateRoute = (data) => {
  return api.post('/api/trips/calculate_route/', data);
};

export default api;