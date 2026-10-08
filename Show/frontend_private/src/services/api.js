// src/services/api.js
import axios from 'axios';

// ⚠️ Ne PAS mettre /api dans VITE_API_URL
// On le met ici pour que ça marche pour tous les endpoints
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const API_URL = `${API_BASE.replace(/\/$/, '')}/api`;   // enlève slash final puis ajoute /api

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Intercepteur : ajoute le token ──────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Intercepteur : gère le 401 + refresh ────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          if (response.data.access) {
            localStorage.setItem('access_token', response.data.access);
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;