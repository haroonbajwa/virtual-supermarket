import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with base URL
const API = axios.create({ baseURL: API_URL });

// Add token to requests if available
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth services
export const login = (email, password) => API.post('/auth/login', { email, password });
export const getCurrentUser = () => API.get('/auth/me');

// User services (admin only)
export const getUsers = () => API.get('/users');
export const createUser = (userData) => API.post('/auth/register', userData);
export const updateUser = (id, userData) => API.put(`/users/${id}`, userData);
export const deleteUser = (id) => API.delete(`/users/${id}`);

// Layout services
export const getLayouts = () => API.get('/layouts');
export const getLayoutById = (id) => API.get(`/layouts/${id}`);
export const createLayout = (layoutData) => API.post('/layouts', layoutData);
export const updateLayout = (id, layoutData) => API.put(`/layouts/${id}`, layoutData);
export const deleteLayout = (id) => API.delete(`/layouts/${id}`);
export const assignLayout = (id, ownerId) => API.patch(`/layouts/${id}/assign`, { ownerId });
