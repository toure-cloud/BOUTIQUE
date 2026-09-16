// frontend_public/src/lib/logger.js

// =============================================
// ✅ LOGGER SÉCURISÉ
// - Aucun log en production
// - Masque automatiquement les données sensibles
// =============================================

const isDev = import.meta.env.DEV;

// Champs dont le NOM contient un de ces mots → masqués automatiquement
const SENSITIVE_KEYWORDS = [
  'password',
  'access',
  'refresh',
  'token',
  'authorization',
  'secret',
  'apikey',
  'api_key',
  'otp',
  'credential',
];

function isSensitiveKey(key) {
  const k = String(key).toLowerCase();
  return SENSITIVE_KEYWORDS.some((s) => k.includes(s));
}

/**
 * Masque récursivement les valeurs sensibles d'un objet.
 */
function mask(value, depth = 0) {
  if (depth > 4) return '[deep]';
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (value instanceof Error) {
    return { name: value.name, message: value.message };
  }
  if (Array.isArray(value)) {
    return value.map((v) => mask(v, depth + 1));
  }

  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (isSensitiveKey(k)) {
      out[k] = '***';
    } else if (typeof v === 'object') {
      out[k] = mask(v, depth + 1);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function safeArgs(args) {
  return args.map((a) => (typeof a === 'object' && a !== null ? mask(a) : a));
}

export const logger = {
  log: (...args) => {
    if (!isDev) return;
    console.log(...safeArgs(args));
  },
  info: (...args) => {
    if (!isDev) return;
    console.info(...safeArgs(args));
  },
  warn: (...args) => {
    if (!isDev) return;
    console.warn(...safeArgs(args));
  },
  error: (...args) => {
    if (!isDev) return;
    console.error(...safeArgs(args));
  },
};

export default logger;