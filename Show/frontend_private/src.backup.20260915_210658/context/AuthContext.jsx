// frontend_private/src/context/AuthContext.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { logger } from '../lib/logger';

// =============================================
// ✅ NORMALISATION DE L'URL API
// Garantit que l'URL finit toujours par /api
// =============================================
const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const API_URL = RAW_API_URL.replace(/\/+$/, '').endsWith('/api')
  ? RAW_API_URL.replace(/\/+$/, '')
  : `${RAW_API_URL.replace(/\/+$/, '')}/api`;

// =============================================
// ✅ CLÉS DE STOCKAGE
// =============================================
const STORAGE_KEYS = {
  ACCESS: 'access_token',           // admin/staff (JWT)
  REFRESH: 'refresh_token',         // admin/staff (JWT)
  CLIENT_TOKEN: 'client_api_token', // client (token simple)
  CLIENT_ID: 'client_id',           // client (id)
  CLIENT_DATA: 'client_data',       // client (infos)
};

// =============================================
// ✅ HELPERS DE STOCKAGE
// =============================================
const storage = {
  get: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* quota, mode privé… */
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach((k) => storage.remove(k));
  },
};

// =============================================
// ✅ CONTEXT
// =============================================
const AuthContext = createContext(null);

// =============================================
// ✅ PROVIDER
// =============================================
export const AuthProvider = ({ children }) => {
  // ---- Admin (JWT) ----
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(() => storage.get(STORAGE_KEYS.ACCESS));
  const [refreshToken, setRefreshToken] = useState(() => storage.get(STORAGE_KEYS.REFRESH));

  // ---- Client (token simple) ----
  const [client, setClient] = useState(() => {
    const raw = storage.get(STORAGE_KEYS.CLIENT_DATA);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });
  const [clientToken, setClientToken] = useState(() => storage.get(STORAGE_KEYS.CLIENT_TOKEN));

  // =============================================
  // ✅ GESTION DES TOKENS ADMIN (JWT)
  // =============================================
  const saveTokens = useCallback((access, refresh) => {
    storage.set(STORAGE_KEYS.ACCESS, access);
    storage.set(STORAGE_KEYS.REFRESH, refresh);
    setAccessToken(access);
    setRefreshToken(refresh);
  }, []);

  const clearAdminAuth = useCallback(() => {
    storage.remove(STORAGE_KEYS.ACCESS);
    storage.remove(STORAGE_KEYS.REFRESH);
    storage.remove('otp_token');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  // =============================================
  // ✅ GESTION DU TOKEN CLIENT
  // =============================================
  const saveClientAuth = useCallback((clientData, token) => {
    storage.set(STORAGE_KEYS.CLIENT_TOKEN, token);
    storage.set(STORAGE_KEYS.CLIENT_ID, String(clientData.id));
    storage.set(STORAGE_KEYS.CLIENT_DATA, JSON.stringify(clientData));
    setClient(clientData);
    setClientToken(token);
  }, []);

  const clearClientAuth = useCallback(() => {
    storage.remove(STORAGE_KEYS.CLIENT_TOKEN);
    storage.remove(STORAGE_KEYS.CLIENT_ID);
    storage.remove(STORAGE_KEYS.CLIENT_DATA);
    setClient(null);
    setClientToken(null);
  }, []);

  const clearAuth = useCallback(() => {
    clearAdminAuth();
    clearClientAuth();
  }, [clearAdminAuth, clearClientAuth]);

  // =============================================
  // ✅ FETCH ADMIN : /api/me/
  // =============================================
  const fetchCurrentUser = useCallback(
    async (token = accessToken) => {
      if (!token) {
        setLoading(false);
        return null;
      }

      try {
        const res = await fetch(`${API_URL}/me/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
          return data;
        }

        if (res.status === 401 || res.status === 403) {
          logger.warn('Token invalide ou expiré, déconnexion admin.');
          clearAdminAuth();
        }
        return null;
      } catch (err) {
        logger.error('Erreur fetchCurrentUser :', err);
        clearAdminAuth();
        return null;
      } finally {
        setLoading(false);
      }
    },
    [accessToken, clearAdminAuth]
  );

  // =============================================
  // ✅ LOGIN ADMIN (JWT)
  // =============================================
  const login = useCallback(
    async (usernameOrEmail, password) => {
      try {
        // ⚠️ On ne log JAMAIS l'identifiant ni le mot de passe
        logger.log('Tentative de login admin…');

        const res = await fetch(`${API_URL}/token/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ username: usernameOrEmail, password }),
        });

        // ⚠️ On ne log JAMAIS le contenu de la réponse (elle contient les tokens)
        logger.log('Réponse login admin reçue, status:', res.status);

        const textResponse = await res.text();

        if (
          textResponse.trim().startsWith('<!DOCTYPE') ||
          textResponse.includes('<html')
        ) {
          logger.warn('Réponse HTML reçue (CSRF ou URL incorrecte).');
          return {
            success: false,
            error:
              "Erreur serveur (réponse HTML). Vérifiez CSRF ou l'URL de l'endpoint.",
            isHtml: true,
          };
        }

        let data;
        try {
          data = JSON.parse(textResponse);
        } catch {
          return { success: false, error: 'Réponse du serveur non-JSON.' };
        }

        if (!res.ok) {
          // On log juste le status et le message d'erreur, jamais les tokens
          logger.warn('Erreur login admin, status:', res.status);
          return {
            success: false,
            error: data.error || data.detail || `Erreur ${res.status}`,
          };
        }

        if (!data.access || !data.refresh) {
          return { success: false, error: 'Tokens manquants dans la réponse.' };
        }

        saveTokens(data.access, data.refresh);

        let currentUser = null;
        if (data.user) {
          currentUser = data.user;
          setUser(data.user);
        } else {
          currentUser = await fetchCurrentUser(data.access);
        }

        logger.log('Login admin réussi.');
        return { success: true, user: currentUser };
      } catch (err) {
        logger.error('Erreur login admin :', err);
        return {
          success: false,
          error: err.message || 'Erreur de connexion au serveur',
        };
      }
    },
    [fetchCurrentUser, saveTokens]
  );

  // =============================================
  // ✅ LOGIN CLIENT
  // =============================================
  const clientLogin = useCallback(
    async (email, password) => {
      try {
        logger.log('Tentative de login client…');

        const res = await fetch(`${API_URL}/client/login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data) {
          logger.warn('Erreur login client, status:', res.status);
          return {
            success: false,
            error: data?.error || `Erreur ${res.status}`,
          };
        }

        if (!data.success || !data.api_token || !data.client) {
          return { success: false, error: 'Réponse client invalide.' };
        }

        saveClientAuth(data.client, data.api_token);
        logger.log('Login client réussi.');
        return { success: true, client: data.client };
      } catch (err) {
        logger.error('Erreur login client :', err);
        return {
          success: false,
          error: err.message || 'Erreur de connexion',
        };
      }
    },
    [saveClientAuth]
  );

  // =============================================
  // ✅ REGISTER CLIENT
  // =============================================
  const clientRegister = useCallback(
    async (payload) => {
      try {
        logger.log('Tentative d’inscription client…');

        const res = await fetch(`${API_URL}/client/register/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data) {
          logger.warn('Erreur inscription client, status:', res.status);
          return {
            success: false,
            error: data?.error || `Erreur ${res.status}`,
          };
        }

        if (!data.success) {
          return { success: false, error: data.error || 'Inscription échouée.' };
        }

        if (data.api_token && data.client) {
          saveClientAuth(data.client, data.api_token);
        }

        logger.log('Inscription client réussie.');
        return {
          success: true,
          client: data.client,
          api_token: data.api_token,
        };
      } catch (err) {
        logger.error('Erreur inscription client :', err);
        return {
          success: false,
          error: err.message || 'Erreur de connexion',
        };
      }
    },
    [saveClientAuth]
  );

  // =============================================
  // ✅ LOGOUT
  // =============================================
  const logout = useCallback(() => {
    logger.log('Déconnexion admin.');
    clearAuth();
  }, [clearAuth]);

  const clientLogout = useCallback(() => {
    logger.log('Déconnexion client.');
    clearClientAuth();
  }, [clearClientAuth]);

  // =============================================
  // ✅ CHARGEMENT INITIAL
  // =============================================
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // =============================================
  // ✅ VALEUR DU CONTEXT
  // =============================================
  const value = useMemo(
    () => ({
      // ---- Admin ----
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: !!(user?.is_staff || user?.is_superuser),
      accessToken,
      refreshToken,
      login,
      logout,
      fetchCurrentUser,

      // ---- Client ----
      client,
      clientToken,
      isClientAuthenticated: !!client && !!clientToken,
      clientLogin,
      clientRegister,
      clientLogout,

      // ---- Divers ----
      clearAuth,
      API_URL,
    }),
    [
      user,
      loading,
      accessToken,
      refreshToken,
      login,
      logout,
      fetchCurrentUser,
      client,
      clientToken,
      clientLogin,
      clientRegister,
      clientLogout,
      clearAuth,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// =============================================
// ✅ HOOK
// =============================================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur de AuthProvider");
  }
  return context;
};

// =============================================
// ✅ LOG DE DÉMARRAGE (dev uniquement, sans secret)
// =============================================
logger.log('API_URL configurée :', API_URL);

export default AuthContext;