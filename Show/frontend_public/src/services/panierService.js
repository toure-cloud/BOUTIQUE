import api from './api';

export const panierService = {
  getPanier: async (clientId) => {
    const response = await api.get(`/client/panier/${clientId}/`);
    return response.data;
  },

  ajouterProduit: async (clientId, produitId, quantite) => {
    const response = await api.post(`/client/panier/${clientId}/`, {
      produit_id: produitId,
      quantite: quantite,
    });
    return response.data;
  },

  supprimerLigne: async (clientId, ligneId) => {
    const response = await api.delete(`/client/panier/${clientId}/`, {
      data: { ligne_id: ligneId },
    });
    return response.data;
  },

  // ✅ AJOUTER CETTE MÉTHODE
  passerCommande: async (clientId, commandeData) => {
    const response = await api.post(`/client/panier/${clientId}/commander/`, commandeData);
    return response.data;
  },
};