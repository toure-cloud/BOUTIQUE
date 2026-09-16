// src/services/produitService.js
import api from './api';
import { logger } from '../lib/logger';

export const produitService = {
  getProduits: async (params = {}) => {
    try {
      const response = await api.get('/produits/', { params });
      return response.data;
    } catch (error) {
      logger.warn('Erreur getProduits');
      throw error;
    }
  },

  getProduitById: async (id) => {
    try {
      const response = await api.get(`/produits/${id}/`);
      return response.data;
    } catch (error) {
      logger.warn(`Erreur getProduitById(${id})`);
      throw error;
    }
  },

  getProduitsByCategorie: async (categorie) => {
    try {
      const response = await api.get('/produits/', { params: { categorie } });
      return response.data;
    } catch (error) {
      logger.warn(`Erreur getProduitsByCategorie(${categorie})`);
      throw error;
    }
  },
};

export default produitService;