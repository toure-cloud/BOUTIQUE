// src/services/inscriptionService.js
import api from './api';

export const inscriptionService = {
  // Récupérer toutes les inscriptions
  // ⚠️ Corrigé : /admin/inscriptions/ → /inscriptions/
  getInscriptions: async (params = {}) => {
    const response = await api.get('/inscriptions/', { params });
    return response.data;
  },

  getInscriptionsByEvenement: async (evenementId) => {
    const response = await api.get('/inscriptions/', {
      params: { evenement: evenementId },
    });
    return response.data;
  },

  updateStatut: async (id, statut) => {
    const response = await api.patch(`/inscriptions/${id}/`, { statut });
    return response.data;
  },

  confirmer: async (id) => {
    const response = await api.post(`/inscriptions/${id}/confirmer/`);
    return response.data;
  },

  annuler: async (id) => {
    const response = await api.post(`/inscriptions/${id}/annuler/`);
    return response.data;
  },

  exporterCSV: async (evenementId) => {
    const response = await api.get('/inscriptions/export/', {
      params: { evenement: evenementId },
      responseType: 'blob',
    });
    return response.data;
  },
};