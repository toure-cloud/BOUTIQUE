// src/services/commandeService.js
import api from './api';
import { logger } from '../lib/logger';

export const commandeService = {
  creerCommande: async (commandeData) => {
    try {
      const response = await api.post('/commandes/', commandeData);
      return response.data;
    } catch (error) {
      logger.warn('Erreur création commande, status:', error.response?.status);
      throw error;
    }
  },

  // ✅ Le backend filtre automatiquement via X-Client-Token
  getCommandesClient: async () => {
    try {
      const response = await api.get('/commandes/');
      return response.data;
    } catch (error) {
      logger.warn('Erreur getCommandesClient, status:', error.response?.status);
      throw error;
    }
  },

  getCommandeById: async (commandeId) => {
    try {
      const response = await api.get(`/commandes/${commandeId}/`);
      return response.data;
    } catch (error) {
      logger.warn(`Erreur getCommandeById(${commandeId}), status:`, error.response?.status);
      throw error;
    }
  },
};

export default commandeService;