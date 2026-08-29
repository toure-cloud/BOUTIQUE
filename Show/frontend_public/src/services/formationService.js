// src/services/formationService.js
import api from './api';

export const formationService = {
  // Récupérer toutes les formations
  getFormations: async (params = {}) => {
    const response = await api.get('/formations/', { params });
    return response.data;
  },

  // Récupérer une formation par ID
  getFormationById: async (id) => {
    const response = await api.get(`/formations/${id}/`);
    return response.data;
  },

  // Vérifier le statut live
  getLiveStatus: async (id) => {
    const response = await api.get(`/formations/${id}/live_status/`);
    return response.data;
  },

  // S'inscrire à une formation
  inscrire: async (formationId, notes = '') => {
    const response = await api.post('/inscriptions-formation/', {
      formation: formationId,
      notes: notes,
    });
    return response.data;
  },

  // Générer un code d'accès
  genererCode: async (inscriptionId) => {
    const response = await api.post(`/inscriptions-formation/${inscriptionId}/generer_code/`);
    return response.data;
  },

  // Vérifier un code d'accès
  verifierCode: async (code, formationId) => {
    const response = await api.post('/verifier-code/', {
      code,
      formation_id: formationId,
    });
    return response.data;
  },

  // Récupérer les inscriptions du client
  getMesInscriptions: async () => {
    const response = await api.get('/inscriptions-formation/');
    return response.data;
  },
};