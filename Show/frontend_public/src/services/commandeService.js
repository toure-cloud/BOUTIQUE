// frontend_public/src/services/commandeService.js
import api from './api';

export const commandeService = {
  creerCommande: async (commandeData) => {
    try {
      const response = await api.post('/commandes/', commandeData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur création commande:', error);
      throw error;
    }
  },
    // ✅ Récupérer les commandes d'un client
  getCommandesClient: async (clientId) => {
    try {
      const response = await api.get(`/commandes/?client=${clientId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getCommandesClient:', error);
      throw error;
    }
  },
  getCommandeById: async (commandeId) => {
    try {
      const response = await api.get(`/commandes/${commandeId}/`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getCommandeById:', error);
      throw error;
    }
  },
};
