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
};