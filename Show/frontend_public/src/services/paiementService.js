// src/services/paiementService.js
import api from './api';
import { logger } from '../lib/logger';

export const paiementService = {
  getMoyensPaiement: async () => {
    try {
      const response = await api.get('/moyens-paiement/');
      const data = response.data;
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      logger.warn('Erreur getMoyensPaiement');
      throw error;
    }
  },

  genererQRCode: async (montant, moyenPaiementId) => {
    try {
      const response = await api.post('/paiements/generer-qr/', {
        montant,
        moyen_paiement: moyenPaiementId,
      });
      return response.data;
    } catch (error) {
      logger.warn('Erreur generation QR code, status:', error.response?.status);
      throw error;
    }
  },

  paiementCarte: async (data) => {
    try {
      const response = await api.post('/paiements/carte/', data);
      return response.data;
    } catch (error) {
      logger.warn('Erreur paiement carte, status:', error.response?.status);
      throw error;
    }
  },

  verifierStatutPaiement: async (reference) => {
    try {
      const response = await api.get(`/paiements/statut/${reference}/`);
      return response.data;
    } catch (error) {
      logger.warn('Erreur verification statut');
      throw error;
    }
  },
};

export default paiementService;