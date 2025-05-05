import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth service
export const auth = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    localStorage.setItem('token', response.data.token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

// Interview service
export const interviews = {
  start: async (formData) => {
    const response = await api.post('/interviews/start', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  submitAnswer: async (formData) => {
    const response = await api.post('/interviews/submit-answer', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getFeedback: async () => {
    const response = await api.get('/interviews/feedback');
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/interviews/history');
    return response.data;
  },
};

// Resume service
export const resumes = {
  analyze: async (formData) => {
    const response = await api.post('/resumes/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/resumes/history');
    return response.data;
  },
};

export default api; 