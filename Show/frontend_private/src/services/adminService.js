import { logger } from '../lib/logger';
// src/services/adminService.js
import api from "./api";

export const adminService = {
  // =============================================
  // DASHBOARD  (route custom backend — garder si définie)
  // =============================================
  getDashboardStats: async () => {
    try {
      const response = await api.get("/admin/dashboard/stats/");
      return response.data;
    } catch (error) {
      logger.error("❌ Erreur dashboard stats:", error);
      throw error;
    }
  },

  // =============================================
  // PRODUITS
  // =============================================
  getProduits: async (params = {}) => {
    const response = await api.get("/produits/", { params });
    return response.data;
  },

  createProduitWithImages: async (formData, onProgress) => {
    const response = await api.post("/produits/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  },

  createProduit: async (data) => {
    const response = await api.post("/produits/", data);
    return response.data;
  },

  updateProduitWithImages: async (id, formData, onProgress) => {
    const response = await api.put(`/produits/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  },

  updateProduit: async (id, data) => {
    const response = await api.put(`/produits/${id}/`, data);
    return response.data;
  },

  deleteProduit: async (id) => {
    const response = await api.delete(`/produits/${id}/`);
    return response.data;
  },

  // =============================================
  // ÉVÉNEMENTS
  // =============================================
  getEvenements: async (params = {}) => {
    const response = await api.get("/evenements/", { params });
    return response.data;
  },

  getEvenementById: async (id) => {
    const response = await api.get(`/evenements/${id}/`);
    return response.data;
  },

  createEvenementWithImage: async (formData, onProgress) => {
    const response = await api.post("/evenements/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  },

  createEvenement: async (data) => {
    const response = await api.post("/evenements/", data);
    return response.data;
  },

  updateEvenement: async (id, data) => {
    const response = await api.put(`/evenements/${id}/`, data);
    return response.data;
  },

  deleteEvenement: async (id) => {
    const response = await api.delete(`/evenements/${id}/`);
    return response.data;
  },

  // =============================================
  // PARTICIPATIONS ÉVÉNEMENTS
  // =============================================
  // ⚠️ Corrigé : /admin/participations/ → /participations/
  getParticipantsEvenements: async (params = {}) => {
    const response = await api.get("/participations/", { params });
    return response.data;
  },

  getParticipantsByEvenement: async (evenementId) => {
    try {
      const response = await api.get("/participations/", {
        params: { evenement: evenementId },
      });
      return response.data;
    } catch (error) {
      logger.error("❌ Erreur getParticipantsByEvenement:", error);
      throw error;
    }
  },

  deleteParticipation: async (id) => {
    try {
      const response = await api.delete(`/participations/${id}/`);
      return response.data;
    } catch (error) {
      logger.error("❌ Erreur deleteParticipation:", error);
      throw error;
    }
  },

  updateParticipation: async (id, data) => {
    try {
      const response = await api.put(`/participations/${id}/`, data);
      return response.data;
    } catch (error) {
      logger.error("❌ Erreur updateParticipation:", error);
      throw error;
    }
  },

  // =============================================
  // INSCRIPTIONS FORMATIONS — DELETE
  // =============================================
  deleteInscription: async (id) => {
    try {
      const response = await api.delete(`/inscriptions-formation/${id}/`);
      return response.data;
    } catch (error) {
      logger.error("❌ Erreur deleteInscription:", error);
      throw error;
    }
  },

  // =============================================
  // COMMANDES — DELETE
  // =============================================
  deleteCommande: async (id) => {
    try {
      const response = await api.delete(`/commandes/${id}/`);
      return response.data;
    } catch (error) {
      logger.error(`❌ Erreur deleteCommande(${id}):`, error);
      throw error;
    }
  },

  // =============================================
  // FORMATIONS
  // =============================================
  getFormations: async (params = {}) => {
    const response = await api.get("/formations/", { params });
    return response.data;
  },

  createFormationWithImage: async (formData, onProgress) => {
    const response = await api.post("/formations/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  },

  createFormation: async (data) => {
    const response = await api.post("/formations/", data);
    return response.data;
  },

  updateFormation: async (id, data) => {
    const response = await api.put(`/formations/${id}/`, data);
    return response.data;
  },

  deleteFormation: async (id) => {
    const response = await api.delete(`/formations/${id}/`);
    return response.data;
  },

  // =============================================
  // INSCRIPTIONS FORMATIONS (ADMIN)
  // =============================================
  getInscriptionsFormations: async (params = {}) => {
    try {
      const response = await api.get("/inscriptions-formation/", { params });
      return response.data;
    } catch (error) {
      logger.error("❌ Erreur getInscriptionsFormations:", error);
      throw error;
    }
  },

  // ✅ VALIDER PAIEMENT (action custom backend)
  validerPaiementInscription: async (id) => {
    try {
      const response = await api.post(`/inscriptions-formation/${id}/valider_paiement/`);
      return response.data;
    } catch (error) {
      logger.error("❌ Erreur validerPaiementInscription:", error);
      logger.error("📋 Réponse:", error.response?.data);
      throw error;
    }
  },

  // ✅ REFUSER (action custom backend)
  refuserInscription: async (id) => {
    try {
      const response = await api.post(`/inscriptions-formation/${id}/refuser/`);
      return response.data;
    } catch (error) {
      logger.error("❌ Erreur refuserInscription:", error);
      logger.error("📋 Réponse:", error.response?.data);
      throw error;
    }
  },

  // ✅ GÉNÉRER CODE (action custom backend)
  genererCodeAcces: async (inscriptionId, data = {}) => {
    try {
      const response = await api.post(
        `/inscriptions-formation/${inscriptionId}/generer_code/`,
        data
      );
      return response.data;
    } catch (error) {
      logger.error("❌ Erreur genererCodeAcces:", error);
      logger.error("📋 Réponse:", error.response?.data);
      throw error;
    }
  },

  // 🔄 PATCH générique (fallback : notes, etc.)
  updateInscription: async (id, data) => {
    try {
      const response = await api.patch(`/inscriptions-formation/${id}/`, data);
      return response.data;
    } catch (error) {
      logger.error("❌ Erreur updateInscription:", error);
      logger.error("📋 Réponse:", error.response?.data);
      throw error;
    }
  },

  deleteInscription: async (id) => {
    try {
      const response = await api.delete(`/inscriptions-formation/${id}/`);
      return response.data;
    } catch (error) {
      logger.error("❌ Erreur deleteInscription:", error);
      throw error;
    }
  },

  // =============================================
  // PAIEMENTS
  // =============================================
  getPaiements: async (params = {}) => {
    try {
      const response = await api.get("/paiements/", { params });
      return response.data;
    } catch (error) {
      logger.error("❌ Erreur getPaiements:", error);
      throw error;
    }
  },

  validerPaiement: async (id) => {
    try {
      const response = await api.post(`/paiements/${id}/valider/`);
      return response.data;
    } catch (error) {
      logger.error("❌ Erreur validerPaiement:", error);
      throw error;
    }
  },

  annulerPaiement: async (id) => {
    try {
      const response = await api.post(`/paiements/${id}/annuler/`);
      return response.data;
    } catch (error) {
      logger.error("❌ Erreur annulerPaiement:", error);
      throw error;
    }
  },

  rembourserPaiement: async (id) => {
    try {
      const response = await api.post(`/paiements/${id}/rembourser/`);
      return response.data;
    } catch (error) {
      logger.error("❌ Erreur rembourserPaiement:", error);
      throw error;
    }
  },

  // =============================================
  // CLIENTS / UTILISATEURS
  // =============================================
  getClients: async (params = {}) => {
    const response = await api.get("/clients/", { params });
    return response.data;
  },

  getClient: async (id) => {
    const response = await api.get(`/clients/${id}/`);
    return response.data;
  },

  createClient: async (data) => {
    const response = await api.post("/clients/", data);
    return response.data;
  },

  updateClient: async (id, data) => {
    const response = await api.put(`/clients/${id}/`, data);
    return response.data;
  },

  deleteClient: async (id) => {
    const response = await api.delete(`/clients/${id}/`);
    return response.data;
  },

  // =============================================
  // COMMANDES
  // =============================================
  getCommandes: async (params = {}) => {
    try {
      const response = await api.get("/commandes/", { params });
      return response.data;
    } catch (error) {
      logger.error("❌ Erreur getCommandes:", error);
      throw error;
    }
  },

  getCommande: async (id) => {
    try {
      const response = await api.get(`/commandes/${id}/`);
      return response.data;
    } catch (error) {
      logger.error(`❌ Erreur getCommande(${id}):`, error);
      throw error;
    }
  },

  getCommandeDetails: async (commandeId) => {
    try {
      const response = await api.get(`/commandes/${commandeId}/`);
      return response.data;
    } catch (error) {
      logger.error("Erreur récupération détails commande:", error);
      throw error;
    }
  },

  updateCommande: async (id, data) => {
    try {
      const response = await api.patch(`/commandes/${id}/`, data);
      return response.data;
    } catch (error) {
      logger.error(`❌ Erreur updateCommande(${id}):`, error);
      throw error;
    }
  },

  // =============================================
  // INSCRIPTIONS RELOOKING
  // =============================================
  getInscriptionsRelooking: async (params = {}) => {
    const response = await api.get("/inscriptions-relooking/", { params });
    return response.data;
  },

  getInscriptionRelookingById: async (id) => {
    const response = await api.get(`/inscriptions-relooking/${id}/`);
    return response.data;
  },

  updateInscriptionRelooking: async (id, data) => {
    const response = await api.patch(`/inscriptions-relooking/${id}/`, data);
    return response.data;
  },

  // =============================================
  // FORFAITS
  // =============================================
  getForfaits: async (params = {}) => {
    const response = await api.get("/forfaits/", { params });
    return response.data;
  },

  createForfait: async (data) => {
    const response = await api.post("/forfaits/", data);
    return response.data;
  },

  updateForfait: async (id, data) => {
    const response = await api.put(`/forfaits/${id}/`, data);
    return response.data;
  },

  deleteForfait: async (id) => {
    const response = await api.delete(`/forfaits/${id}/`);
    return response.data;
  },

  // =============================================
  // RELOOKING FEMME
  // =============================================
  getRubriquesFemme: async (params = {}) => {
    const response = await api.get("/relooking-femme/", { params });
    return response.data;
  },

  createRubriqueFemme: async (data) => {
    const response = await api.post("/relooking-femme/", data);
    return response.data;
  },

  updateRubriqueFemme: async (id, data) => {
    const response = await api.put(`/relooking-femme/${id}/`, data);
    return response.data;
  },

  deleteRubriqueFemme: async (id) => {
    const response = await api.delete(`/relooking-femme/${id}/`);
    return response.data;
  },

  // =============================================
  // RELOOKING HOMME
  // =============================================
  getRubriquesHomme: async (params = {}) => {
    const response = await api.get("/relooking-homme/", { params });
    return response.data;
  },

  createRubriqueHomme: async (data) => {
    const response = await api.post("/relooking-homme/", data);
    return response.data;
  },

  updateRubriqueHomme: async (id, data) => {
    const response = await api.put(`/relooking-homme/${id}/`, data);
    return response.data;
  },

  deleteRubriqueHomme: async (id) => {
    const response = await api.delete(`/relooking-homme/${id}/`);
    return response.data;
  },

  // =============================================
  // ATELIERS
  // =============================================
  getAteliers: async (params = {}) => {
    const response = await api.get("/ateliers/", { params });
    return response.data;
  },

  createAtelier: async (data) => {
    const response = await api.post("/ateliers/", data);
    return response.data;
  },

  updateAtelier: async (id, data) => {
    const response = await api.put(`/ateliers/${id}/`, data);
    return response.data;
  },

  deleteAtelier: async (id) => {
    const response = await api.delete(`/ateliers/${id}/`);
    return response.data;
  },

  // =============================================
  // PARAMÈTRES / CONFIGURATION
  // =============================================
  getSiteSettings: async () => {
    const response = await api.get("/site-settings/");
    return response.data;
  },

  updateSiteSettings: async (data) => {
    const response = await api.put("/site-settings/", data);
    return response.data;
  },

  getMoyensPaiement: async () => {
    const response = await api.get("/moyens-paiement/");
    return response.data;
  },

  updateMoyensPaiement: async (id, data) => {
    const response = await api.put(`/moyens-paiement/${id}/`, data);
    return response.data;
  },

  // =============================================
  // LOGS (route custom — à garder si backend la définit ainsi)
  // =============================================
  getLogs: async (params = {}) => {
    const response = await api.get("/admin/admin-logs/", { params });
    return response.data;
  },
};

export default adminService;