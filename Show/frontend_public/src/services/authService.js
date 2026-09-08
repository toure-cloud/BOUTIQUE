// frontend_public/src/services/authService.js
import api from './api';

export const authService = {
  // Inscription client
  clientRegister: async (data) => {
    const response = await api.post('/client/register/', data);
    return response.data;
  },

  // Connexion client
  clientLogin: async (email, password) => {
    const response = await api.post('/client/login/', { email, password });
    return response.data;
  },

  // Récupérer le client connecté
  getClient: async () => {
    const stored = localStorage.getItem('client_data');
    return stored ? JSON.parse(stored) : null;
  },
};