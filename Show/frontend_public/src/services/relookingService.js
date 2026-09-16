// src/services/relookingService.js
import api from './api';
import { logger } from '../lib/logger';
import { normaliserPrix, normaliserTelephone } from '../lib/normalize';

export const relookingService = {
  // ===== RELOOKING HOMME =====
  getRubriquesHomme: async (params = {}) => {
    const response = await api.get('/relooking-homme/', { params });
    return response.data;
  },
  getRubriqueHommeById: async (id) => {
    const response = await api.get(`/relooking-homme/${id}/`);
    return response.data;
  },
  getRubriquesHommeByCategorie: async (categorie) => {
    const response = await api.get('/relooking-homme/par_categorie/', {
      params: { categorie },
    });
    return response.data;
  },

  // ===== RELOOKING FEMME =====
  getRubriquesFemme: async (params = {}) => {
    const response = await api.get('/relooking-femme/', { params });
    return response.data;
  },
  getRubriqueFemmeById: async (id) => {
    const response = await api.get(`/relooking-femme/${id}/`);
    return response.data;
  },
  getRubriquesFemmeByCategorie: async (categorie) => {
    const response = await api.get('/relooking-femme/par_categorie/', {
      params: { categorie },
    });
    return response.data;
  },

  // ===== ATELIERS =====
  getAteliers: async (params = {}) => {
    const response = await api.get('/ateliers/', { params });
    return response.data;
  },
  getAtelierById: async (id) => {
    const response = await api.get(`/ateliers/${id}/`);
    return response.data;
  },
  getAteliersByCategorie: async (categorie) => {
    const response = await api.get('/ateliers/par_categorie/', {
      params: { categorie },
    });
    return response.data;
  },

  // ===== INSCRIPTION RELOOKING =====
  /**
   * Inscription à une prestation relooking.
   * - Normalise les données (téléphone, prix) avant l'envoi.
   * - Lance une erreur structurée en cas d'échec.
   */
  inscrire: async (data) => {
    // ✅ Normalisation
    const payload = {
      ...data,
      telephone: normaliserTelephone(data.telephone),
      prix: normaliserPrix(data.prix),
    };

    logger.log('Envoi inscription relooking…');

    try {
      const response = await api.post('/inscriptions-relooking/', payload);
      logger.log('Inscription relooking réussie.');
      return response.data;
    } catch (err) {
      // ✅ Construit une erreur structurée exploitable par le composant
      const status = err.response?.status;
      const responseData = err.response?.data;

      logger.warn('Erreur inscription relooking, status:', status);

      // Si le backend renvoie un objet { champ: [messages] }, on le met dans err.details
      const details =
        responseData && typeof responseData === 'object' && !Array.isArray(responseData)
          ? responseData
          : null;

      const message =
        (typeof responseData === 'string' && responseData) ||
        responseData?.error ||
        responseData?.detail ||
        err.message ||
        `Erreur ${status || 'inconnue'}`;

      const wrapped = new Error(message);
      wrapped.status = status;
      wrapped.details = details;
      wrapped.original = err;
      throw wrapped;
    }
  },
};