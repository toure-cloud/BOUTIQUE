// frontend_public/src/services/formationService.js
import api from './api';

export const formationService = {
  // =============================================
  // ✅ LECTURE (Public)
  // =============================================

  getFormations: async (params = {}) => {
    try {
      const response = await api.get('/formations/', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getFormations:', error);
      throw error;
    }
  },

  getFormationById: async (id) => {
    try {
      const response = await api.get(`/formations/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getFormationById(${id}):`, error);
      throw error;
    }
  },

  getFormationsByStatut: async (statut) => {
    try {
      const response = await api.get('/formations/', { params: { statut } });
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getFormationsByStatut(${statut}):`, error);
      throw error;
    }
  },

  // =============================================
  // ✅ INSCRIPTION (Public)
  // =============================================

  // ✅ Méthode principale - utilise les données du formulaire
  inscrire: async (formationId, clientData, notes = '') => {
    try {
      // ✅ Utiliser les données passées en paramètre
      const payload = {
        formation: parseInt(formationId),
        email: clientData?.email || '',
        nom: clientData?.nom || '',
        prenom: clientData?.prenom || '',
        telephone: clientData?.telephone || '',
        notes: notes || '',
      };
      
      console.log('📦 Payload inscription:', payload);
      
      const response = await api.post('/inscriptions-formation/', payload);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      if (error.response?.data) {
        console.error('📋 Erreur backend:', error.response.data);
      }
      throw error;
    }
  },

  // ✅ Alias pour compatibilité
  inscrireAvecDonnees: async (formationId, clientData, notes = '') => {
    return formationService.inscrire(formationId, clientData, notes);
  },

  // =============================================
  // ✅ PAIEMENT (Public)
  // =============================================

  creerTransaction: async (data) => {
    try {
      const payload = {
        inscription: data.inscriptionId,
        moyen_paiement: data.moyenPaiement,
        details: {
          email: data.email || '',
          nom: data.nom || '',
          prenom: data.prenom || '',
          telephone: data.telephone || '',
          notes: data.notes || '',
        }
      };
      
      console.log('📦 Payload transaction:', payload);
      
      const response = await api.post('/transactions/', payload);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur création transaction:', error);
      if (error.response?.data) {
        console.error('📋 Erreur backend:', error.response.data);
      }
      throw error;
    }
  },

  // =============================================
  // ✅ ADMIN (Nécessite authentification)
  // =============================================

  getInscriptions: async (params = {}) => {
    try {
      const response = await api.get('/admin/inscriptions-formation/', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getInscriptions:', error);
      throw error;
    }
  },

  getInscriptionById: async (id) => {
    try {
      const response = await api.get(`/admin/inscriptions-formation/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur getInscriptionById(${id}):`, error);
      throw error;
    }
  },

  updateInscription: async (id, data) => {
    try {
      const response = await api.put(`/admin/inscriptions-formation/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur updateInscription(${id}):`, error);
      throw error;
    }
  },

  deleteInscription: async (id) => {
    try {
      const response = await api.delete(`/admin/inscriptions-formation/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur deleteInscription(${id}):`, error);
      throw error;
    }
  },

  getTransactions: async (params = {}) => {
    try {
      const response = await api.get('/admin/transactions/', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getTransactions:', error);
      throw error;
    }
  },

  validerTransaction: async (id) => {
    try {
      const response = await api.post(`/admin/transactions/${id}/valider/`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur validerTransaction(${id}):`, error);
      throw error;
    }
  },
};

export default formationService;