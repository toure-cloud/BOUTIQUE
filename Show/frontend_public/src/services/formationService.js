// src/services/formationService.js
import api from './api';
import { logger } from '../lib/logger';

export const formationService = {
  // ===== LECTURE =====
  getFormations: async (params = {}) => {
    try {
      const response = await api.get('/formations/', { params });
      return response.data;
    } catch (error) {
      logger.warn('Erreur getFormations, status:', error.response?.status);
      throw error;
    }
  },

  getFormationById: async (id) => {
    try {
      const response = await api.get(`/formations/${id}/`);
      return response.data;
    } catch (error) {
      logger.warn(`Erreur getFormationById(${id}), status:`, error.response?.status);
      throw error;
    }
  },

  getFormationsByStatut: async (statut) => {
    try {
      const response = await api.get('/formations/', { params: { statut } });
      return response.data;
    } catch (error) {
      logger.warn(`Erreur getFormationsByStatut(${statut})`);
      throw error;
    }
  },

  // ===== INSCRIPTION =====
  inscrire: async (formationId, clientData, notes = '') => {
    try {
      const payload = {
        formation: parseInt(formationId),
        email: clientData?.email || '',
        nom: clientData?.nom || '',
        prenom: clientData?.prenom || '',
        telephone: clientData?.telephone || '',
        notes: notes || '',
      };

      const response = await api.post('/inscriptions-formation/', payload);
      return response.data;
    } catch (error) {
      logger.warn('Erreur inscription formation, status:', error.response?.status);
      throw error;
    }
  },

  // Alias
  inscrireAvecDonnees: async (formationId, clientData, notes = '') => {
    return formationService.inscrire(formationId, clientData, notes);
  },

  // ===== PAIEMENT =====
  creerTransaction: async (data) => {
    try {
      const payload = {
        inscription: data.inscriptionId,
        moyen_paiement: data.moyenPaiement,
        details: {
          email: data.email || '',
          nom: data.nom || '',
          prenom: data.prenom || '',
          telephone: data.telephone || '',
          notes: data.notes || '',
        },
      };

      const response = await api.post('/transactions/', payload);
      return response.data;
    } catch (error) {
      logger.warn('Erreur création transaction, status:', error.response?.status);
      throw error;
    }
  },

  // ===== ADMIN =====
  getInscriptions: async (params = {}) => {
    try {
      const response = await api.get('/admin/inscriptions-formation/', { params });
      return response.data;
    } catch (error) {
      logger.warn('Erreur getInscriptions, status:', error.response?.status);
      throw error;
    }
  },

  getInscriptionById: async (id) => {
    try {
      const response = await api.get(`/admin/inscriptions-formation/${id}/`);
      return response.data;
    } catch (error) {
      logger.warn(`Erreur getInscriptionById(${id})`);
      throw error;
    }
  },

  updateInscription: async (id, data) => {
    try {
      const response = await api.put(`/admin/inscriptions-formation/${id}/`, data);
      return response.data;
    } catch (error) {
      logger.warn(`Erreur updateInscription(${id}), status:`, error.response?.status);
      throw error;
    }
  },

  deleteInscription: async (id) => {
    try {
      const response = await api.delete(`/admin/inscriptions-formation/${id}/`);
      return response.data;
    } catch (error) {
      logger.warn(`Erreur deleteInscription(${id})`);
      throw error;
    }
  },

  getTransactions: async (params = {}) => {
    try {
      const response = await api.get('/admin/transactions/', { params });
      return response.data;
    } catch (error) {
      logger.warn('Erreur getTransactions');
      throw error;
    }
  },

  validerTransaction: async (id) => {
    try {
      const response = await api.post(`/admin/transactions/${id}/valider/`);
      return response.data;
    } catch (error) {
      logger.warn(`Erreur validerTransaction(${id})`);
      throw error;
    }
  },

  verifierCode: async (data) => {
    try {
      const response = await api.post('/verifier-code/', data);
      return response.data;
    } catch (error) {
      logger.warn('Erreur vérification code');
      throw error;
    }
  },
};

export default formationService;