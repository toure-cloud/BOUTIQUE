// src/services/paiementService.js
import api from './api';

export const paiementService = {
  // Récupérer les moyens de paiement disponibles
  getMoyensPaiement: async () => {
    const response = await api.get('/moyens-paiement/');
    return response.data;
  },

  // Créer une transaction de paiement
  creerTransaction: async (data) => {
    const response = await api.post('/transactions/', data);
    return response.data;
  },

  // Confirmer un paiement
  confirmerPaiement: async (transactionId) => {
    const response = await api.post(`/transactions/${transactionId}/confirmer_paiement/`);
    return response.data;
  },

  // Annuler un paiement
  annulerPaiement: async (transactionId) => {
    const response = await api.post(`/transactions/${transactionId}/annuler_paiement/`);
    return response.data;
  },

  // Récupérer les transactions du client
  getMesTransactions: async () => {
    const response = await api.get('/transactions/');
    return response.data;
  },
};