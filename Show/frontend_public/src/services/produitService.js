// src/services/produitService.js
import api from './api';

export const produitService = {
  // Récupérer tous les produits
  getProduits: async (params = {}) => {
    const response = await api.get('/produits/', { params });
    return response.data;
  },

  // Récupérer un produit par ID
  getProduitById: async (id) => {
    const response = await api.get(`/produits/${id}/`);
    return response.data;
  },

  // Récupérer les produits par catégorie
  getProduitsByCategorie: async (categorie) => {
    const response = await api.get('/produits/par_categorie/', { params: { categorie } });
    return response.data;
  },

  // Récupérer les produits en promotion
  getProduitsPromotion: async () => {
    const response = await api.get('/produits/promotion/');
    return response.data;
  },
};