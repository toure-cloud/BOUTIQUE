// src/services/evenementService.js
import api from './api';

export const evenementService = {
  getEvenements: async (params = {}) => {
    const response = await api.get('/evenements/', { params });
    return response.data;
  },

  getEvenementById: async (id) => {
    const response = await api.get(`/evenements/${id}/`);
    return response.data;
  },

  participer: async (id, notes = '') => {
    const response = await api.post(`/evenements/${id}/participer/`, { notes });
    return response.data;
  },

  getParticipants: async (id) => {
    const response = await api.get(`/evenements/${id}/participants/`);
    return response.data;
  },
};