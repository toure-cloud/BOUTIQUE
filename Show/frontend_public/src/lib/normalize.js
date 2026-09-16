// src/lib/normalize.js

/**
 * Normalise un numéro de téléphone.
 * Enlève espaces, tirets, indicatifs → garde 10 chiffres.
 */
export function normaliserTelephone(tel) {
  if (!tel) return '';
  let chiffres = String(tel).replace(/\D/g, '');
  // Enlève l'indicatif 225 ou 00225
  if (chiffres.startsWith('00225')) chiffres = chiffres.slice(5);
  else if (chiffres.startsWith('225')) chiffres = chiffres.slice(3);
  // Garde les 10 derniers chiffres
  if (chiffres.length > 10) chiffres = chiffres.slice(-10);
  return chiffres;
}

/**
 * Convertit une valeur en nombre (0 si invalide).
 */
export function normaliserPrix(prix) {
  if (prix === '' || prix === null || prix === undefined) return 0;
  const n = Number(String(prix).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Valide un email côté client (regex simple).
 */
export function validerEmail(email) {
  if (!email) return 'L\'email est obligatoire.';
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Format d\'email invalide.';
  return null;
}

/**
 * Valide un téléphone (10 chiffres commençant par 0).
 */
export function validerTelephone(tel) {
  const t = normaliserTelephone(tel);
  if (!t) return 'Le téléphone est obligatoire.';
  if (!/^0\d{9}$/.test(t)) return 'Format : 10 chiffres commençant par 0.';
  return null;
}

/**
 * Valide un nom/prénom.
 */
export function validerNom(valeur, label = 'Le nom') {
  if (!valeur || !String(valeur).trim()) return `${label} est obligatoire.`;
  const v = String(valeur).trim();
  if (v.length < 2) return `${label} doit contenir au moins 2 caractères.`;
  if (v.length > 50) return `${label} ne doit pas dépasser 50 caractères.`;
  return null;
}

/**
 * Valide un formulaire d'inscription générique.
 * Retourne un objet { champ: [message] } ou null si tout est OK.
 */
export function validerFormulaire(formData) {
  const erreurs = {};

  const emailErr = validerEmail(formData.email);
  if (emailErr) erreurs.email = [emailErr];

  const telErr = validerTelephone(formData.telephone);
  if (telErr) erreurs.telephone = [telErr];

  const nomErr = validerNom(formData.nom, 'Le nom');
  if (nomErr) erreurs.nom = [nomErr];

  const prenomErr = validerNom(formData.prenom, 'Le prénom');
  if (prenomErr) erreurs.prenom = [prenomErr];

  return Object.keys(erreurs).length > 0 ? erreurs : null;
}