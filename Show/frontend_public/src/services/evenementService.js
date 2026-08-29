// src/services/evenementService.js
import api from './api';

export const evenementService = {
  // Récupérer tous les événements
  getEvenements: async (params = {}) => {
    const response = await api.get('/evenements/', { params });
    return response.data;
  },

  // Récupérer un événement par ID
  getEvenementById: async (id) => {
    const response = await api.get(`/evenements/${id}/`);
    return response.data;
  },

  // Participer à un événement
  participer: async (id, notes = '') => {
    const response = await api.post(`/evenements/${id}/participer/`, { notes });
    return response.data;
  },

  // Récupérer les participants d'un événement
  getParticipants: async (id) => {
    const response = await api.get(`/evenements/${id}/participants/`);
    return response.data;
  },
};