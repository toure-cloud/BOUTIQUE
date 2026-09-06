// frontend_public/src/services/produitService.js
import api from './api';

export const produitService = {
  // ✅ Récupérer tous les produits (public)
  getProduits: async (params = {}) => {
    try {
      const response = await api.get('/produits/', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getProduits:', error);
      throw error;
    }
  },

  // ✅ Récupérer un produit par ID
  getProduitById: async (id) => {
    try {
      const response = await api.get(`/produits/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getProduitById(${id}):`, error);
      throw error;
    }
  },

  // ✅ Récupérer les produits par catégorie
  getProduitsByCategorie: async (categorie) => {
    try {
      const response = await api.get('/produits/', { params: { categorie } });
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getProduitsByCategorie(${categorie}):`, error);
      throw error;
    }
  },
};