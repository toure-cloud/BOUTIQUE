// src/services/forfaitService.js
import api from './api';

export const forfaitService = {
  // Récupérer tous les forfaits
  getForfaits: async (params = {}) => {
    const response = await api.get('/forfaits/', { params });
    return response.data;
  },

  // Récupérer un forfait par ID
  getForfaitById: async (id) => {
    const response = await api.get(`/forfaits/${id}/`);
    return response.data;
  },

  // Récupérer les forfaits par type
  getForfaitsByType: async (type) => {
    const response = await api.get('/forfaits/par_type/', { params: { type } });
    return response.data;
  },
};