
import api from './api';

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
    const response = await api.get('/relooking-homme/par_categorie/', { params: { categorie } });
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
    const response = await api.get('/relooking-femme/par_categorie/', { params: { categorie } });
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
    const response = await api.get('/ateliers/par_categorie/', { params: { categorie } });
    return response.data;
  },
};