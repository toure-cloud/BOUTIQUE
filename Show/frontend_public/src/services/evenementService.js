// frontend_public/src/services/evenementService.js
import api from './api';

export const evenementService = {
  // ✅ Récupérer tous les événements (public)
  getEvenements: async (params = {}) => {
    const response = await api.get('/evenements/', { params });
    return response.data;
  },

  // ✅ Récupérer un événement par ID (public)
  getEvenementById: async (id) => {
    const response = await api.get(`/evenements/${id}/`);
    return response.data;
  },

  // ✅ S'inscrire à un événement (public - pas besoin de token)
  inscrireEvenement: async (data) => {
    // ✅ Pas de token nécessaire pour l'inscription
    const response = await api.post('/participations/', data);
    return response.data;
  },

  // ✅ Récupérer les participations (admin uniquement)
  getParticipations: async (params = {}) => {
    const response = await api.get('/participations/', { params });
    return response.data;
  },
};