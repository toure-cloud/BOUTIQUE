// src/hooks/useRelookingInscription.js
import { useCallback, useState } from 'react';
import { relookingService } from '../services/relookingService';
import { validerFormulaire } from '../lib/normalize';
import { useFormMessages } from './useFormMessages';
import { logger } from '../lib/logger';

const FORM_VIDE = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  date: '',
  nb_personnes: 2,
  message: '',
};

export function useRelookingInscription({
  type,
  rubrique,
  withNbPersonnes = false,
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(FORM_VIDE);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Message affiché DANS le dialog (erreurs + succès court)
  const { message, success, error, clear } = useFormMessages();

  // ✅ Message affiché HORS du dialog (succès persistant sur la page)
  const [pageMessage, setPageMessage] = useState(null);

  const handleOpen = useCallback(() => {
    setOpen(true);
    clear();
    setPageMessage(null);
  }, [clear]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setFormData(FORM_VIDE);
      // ⚠️ On NE clear PAS pageMessage ici → il doit rester sur la page
    }, 300);
  }, []);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      clear();

      // Validation client AVANT l'envoi
      const erreursClient = validerFormulaire(formData);
      if (erreursClient) {
        error(
          'Veuillez corriger les erreurs ci-dessous.',
          erreursClient,
          'Formulaire incomplet'
        );
        return;
      }

      setLoading(true);
      try {
        const payload = {
          type,
          rubrique_id: rubrique.id,
          rubrique_nom: rubrique.nom,
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          telephone: formData.telephone,
          message: formData.message,
          prix: rubrique.prix,
          duree: rubrique.duree,
          ...(formData.date ? { date_souhaitee: formData.date } : {}),
          ...(withNbPersonnes
            ? { nb_personnes: Number(formData.nb_personnes) || 2 }
            : {}),
        };

        await relookingService.inscrire(payload);

        // ✅ 1. Affiche le check vert dans le dialog
        setSubmitted(true);

        // ✅ 2. Prépare le message PERSISTANT pour la page
        setPageMessage({
          type: 'success',
          title: 'Inscription réussie',
          text:
            'Votre inscription a bien été enregistrée. Vous recevrez un email de confirmation.',
        });

        // ✅ 3. Ferme le dialog après 2 secondes
        setTimeout(() => handleClose(), 2000);
      } catch (err) {
        const details =
          err.details && typeof err.details === 'object' ? err.details : null;

        if (details) {
          error(
            'Le serveur a refusé votre inscription :',
            details,
            'Erreur de validation'
          );
        } else {
          error(
            err.message || 'Une erreur est survenue. Veuillez réessayer.',
            null,
            'Erreur'
          );
        }
        logger.warn('Erreur inscription relooking, status:', err.status);
      } finally {
        setLoading(false);
      }
    },
    [formData, rubrique, type, withNbPersonnes, error, clear, handleClose]
  );

  const dismissPageMessage = useCallback(() => {
    setPageMessage(null);
  }, []);

  return {
    open,
    formData,
    loading,
    submitted,
    message,
    pageMessage,
    handleOpen,
    handleClose,
    handleFormChange,
    handleSubmit,
    clearMessage: clear,
    dismissPageMessage,
  };
}

export default useRelookingInscription;