// frontend_private/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('access_token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refresh_token'));

  // ========== HELPERS ==========
  const saveTokens = (access, refresh) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    setAccessToken(access);
    setRefreshToken(refresh);
  };

  const clearAuth = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('otp_token');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  // ========== RÉCUPÉRER L'UTILISATEUR CONNECTÉ ==========
  const fetchCurrentUser = useCallback(async (token = accessToken) => {
    if (!token) {
      setLoading(false);
      return null;
    }

    try {
      const res = await fetch(`${API_URL}/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        return data;
      } else {
        clearAuth();
        return null;
      }
    } catch (err) {
      console.error('Erreur fetchCurrentUser:', err);
      clearAuth();
      return null;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // ========== LOGIN ==========
  const login = async (usernameOrEmail, password) => {
    try {
      console.log('🔐 Tentative de login:', usernameOrEmail);
      
      const res = await fetch(`${API_URL}/token/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: usernameOrEmail,
          password,
        }),
      });

      // ✅ Lire la réponse
      const textResponse = await res.text();
      console.log('📥 Réponse brute:', textResponse.substring(0, 200));

      // ✅ Vérifier si c'est du HTML (erreur CSRF)
      if (textResponse.includes('<!DOCTYPE') || textResponse.includes('<html')) {
        return {
          success: false,
          error: 'Erreur CSRF. Veuillez vérifier la configuration du backend.',
          isHtml: true,
        };
      }

      // ✅ Parser le JSON
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (parseError) {
        return {
          success: false,
          error: 'Erreur de format de réponse du serveur.',
        };
      }

      if (!res.ok) {
        return {
          success: false,
          error: data.detail || data.error || `Erreur ${res.status}`,
        };
      }

      if (!data.access || !data.refresh) {
        return {
          success: false,
          error: 'Tokens manquants dans la réponse.',
        };
      }

      saveTokens(data.access, data.refresh);

      if (data.user) {
        setUser(data.user);
      } else {
        await fetchCurrentUser(data.access);
      }

      return {
        success: true,
        user: data.user || user,
      };
    } catch (err) {
      console.error('❌ Erreur login:', err);
      return {
        success: false,
        error: err.message || 'Erreur de connexion au serveur',
      };
    }
  };

  // ========== LOGOUT ==========
  const logout = () => {
    clearAuth();
  };

  // ========== VALEUR DU CONTEXT ==========
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: !!(user?.is_staff || user?.is_superuser),
    accessToken,
    login,
    logout,
    fetchCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider');
  }
  return context;
};

export default AuthContext;