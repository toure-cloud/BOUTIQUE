// frontend_public/src/services/paiementService.js
import api from './api';

export const paiementService = {
  // ✅ Récupérer les moyens de paiement
  getMoyensPaiement: async () => {
    try {
      const response = await api.get('/moyens-paiement/');
      const data = response.data;
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error('❌ Erreur getMoyensPaiement:', error);
      throw error;
    }
  },

  // ✅ Générer un QR code de paiement
  genererQRCode: async (montant, moyenPaiementId) => {
    try {
      const response = await api.post('/paiements/generer-qr/', {
        montant: montant,
        moyen_paiement: moyenPaiementId,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur generation QR code:', error);
      throw error;
    }
  },

  // ✅ Effectuer un paiement par carte bancaire
  paiementCarte: async (data) => {
    try {
      const response = await api.post('/paiements/carte/', data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur paiement carte:', error);
      throw error;
    }
  },

  // ✅ Vérifier le statut d'un paiement
  verifierStatutPaiement: async (reference) => {
    try {
      const response = await api.get(`/paiements/statut/${reference}/`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur verification statut:', error);
      throw error;
    }
  },
};