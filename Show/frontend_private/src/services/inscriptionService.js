// src/services/inscriptionService.js
import api from './api';

export const inscriptionService = {
  // Récupérer toutes les inscriptions
  getInscriptions: async (params = {}) => {
    const response = await api.get('/admin/inscriptions/', { params });
    return response.data;
  },

  // Récupérer les inscriptions d'un événement
  getInscriptionsByEvenement: async (evenementId) => {
    const response = await api.get(`/admin/inscriptions/?evenement=${evenementId}`);
    return response.data;
  },

  // Mettre à jour le statut d'une inscription
  updateStatut: async (id, statut) => {
    const response = await api.patch(`/admin/inscriptions/${id}/`, { statut });
    return response.data;
  },

  // Confirmer une inscription
  confirmer: async (id) => {
    const response = await api.post(`/admin/inscriptions/${id}/confirmer/`);
    return response.data;
  },

  // Annuler une inscription
  annuler: async (id) => {
    const response = await api.post(`/admin/inscriptions/${id}/annuler/`);
    return response.data;
  },

  // Exporter les inscriptions en CSV
  exporterCSV: async (evenementId) => {
    const response = await api.get(`/admin/inscriptions/export/?evenement=${evenementId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};