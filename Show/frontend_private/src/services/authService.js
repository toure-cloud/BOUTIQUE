// src/services/authService.js
import api from './api';

export const authService = {
  // Demander OTP
  requestOTP: async (email) => {
    const response = await api.post('/request-otp/', { email });
    return response.data;
  },

  // Vérifier OTP
  verifyOTP: async (data) => {
    const response = await api.post('/verify-otp/', {
      email: data.email,
      otp: data.otp
    });
    return response.data;
  },

  // Inscription
  register: async (userData) => {
    const response = await api.post('/register/', {
      username: userData.username || userData.email,
      email: userData.email,
      password: userData.password,
      password2: userData.password2,
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      phone: userData.phone || '',
      otp_token: userData.otp_token || '',
    });
    return response.data;
  },

  // Connexion
  login: async (credentials) => {
    const response = await api.post('/token/', {
      username: credentials.username,
      password: credentials.password
    });
    return response.data;
  },

  // Rafraîchir le token
  refreshToken: async (refresh) => {
    const response = await api.post('/token/refresh/', { refresh });
    return response.data;
  },

  // Récupérer le profil
  getProfile: async () => {
    const response = await api.get('/me/');
    return response.data;
  },

  // Mettre à jour le profil
  updateProfile: async (data) => {
    const response = await api.patch('/me/', data);
    return response.data;
  },

  // Changer le mot de passe
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post('/change-password/', {
      old_password: oldPassword,
      new_password: newPassword
    });
    return response.data;
  },
};