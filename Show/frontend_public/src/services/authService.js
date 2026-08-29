// src/services/authService.js
import api from './api';

export const authService = {
  // Inscription
  register: async (userData) => {
    const response = await api.post('/register/', userData);
    return response.data;
  },

  // Connexion (si vous avez configuré JWT)
  login: async (credentials) => {
    // Si vous utilisez JWT
    const response = await api.post('/token/', credentials);
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data;
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/';
  },

  // Récupérer le profil utilisateur
  getProfile: async () => {
    const response = await api.get('/me/');
    return response.data;
  },
};