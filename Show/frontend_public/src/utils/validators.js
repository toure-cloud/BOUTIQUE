// src/utils/validators.js

/**
 * Validation du numéro de téléphone (format Côte d'Ivoire).
 * @param {string} value
 * @returns {string} Message d'erreur ou '' si valide
 */
export const validateTelephone = (value) => {
  if (!value) return 'Le numéro de téléphone est obligatoire.';

  const chiffres = String(value).replace(/\D/g, '');

  if (chiffres.length < 8) return 'Au moins 8 chiffres requis.';
  if (chiffres.length > 15) return 'Maximum 15 chiffres.';
  if (!/^0\d{9}$/.test(chiffres)) {
    return 'Format attendu : 10 chiffres commençant par 0 (ex: 0709871479).';
  }

  return '';
};

/**
 * Validation de l'email.
 */
export const validateEmail = (value) => {
  if (!value) return "L'email est obligatoire.";
  const trimmed = value.trim().toLowerCase();
  if (trimmed.length > 254) return 'Email trop long.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Format d'email invalide.";
  }
  return '';
};

/**
 * Validation du nom/prénom.
 */
export const validateNom = (value, label = 'Le nom') => {
  if (!value || !value.trim()) return `${label} est obligatoire.`;
  const trimmed = value.trim();
  if (trimmed.length < 2) return `${label} doit contenir au moins 2 caractères.`;
  if (trimmed.length > 50) return `${label} ne doit pas dépasser 50 caractères.`;
  if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(trimmed)) {
    return `${label} ne doit contenir que des lettres.`;
  }
  return '';
};

/**
 * Validation des notes.
 */
export const validateNotes = (value) => {
  if (!value) return '';
  if (value.length > 500) return 'Maximum 500 caractères.';
  return '';
};

/**
 * Formate un numéro de téléphone pour l'affichage (XX XX XX XX XX).
 */
export const formatTelephone = (value) => {
  const chiffres = String(value).replace(/\D/g, '').slice(0, 10);
  if (chiffres.length <= 2) return chiffres;
  if (chiffres.length <= 4) return `${chiffres.slice(0, 2)} ${chiffres.slice(2)}`;
  if (chiffres.length <= 6) return `${chiffres.slice(0, 2)} ${chiffres.slice(2, 4)} ${chiffres.slice(4)}`;
  if (chiffres.length <= 8) return `${chiffres.slice(0, 2)} ${chiffres.slice(2, 4)} ${chiffres.slice(4, 6)} ${chiffres.slice(6)}`;
  return `${chiffres.slice(0, 2)} ${chiffres.slice(2, 4)} ${chiffres.slice(4, 6)} ${chiffres.slice(6, 8)} ${chiffres.slice(8, 10)}`;
};