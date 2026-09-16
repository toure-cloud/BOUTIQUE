// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container, Paper, Typography, TextField, Button, Alert,
  Box, InputAdornment, IconButton, Fade, CircularProgress, alpha,
} from '@mui/material';
import {
  Visibility, VisibilityOff, Email, Lock, Login as LoginIcon,
} from '@mui/icons-material';

// ═══════════════════════════════════════════════════════════════════════════════
// PALETTE PROFESSIONNELLE
// ═══════════════════════════════════════════════════════════════════════════════
const T = {
  bg:        '#F8FAFC',
  surface:   '#FFFFFF',
  primary:   '#1E293B',
  secondary: '#334155',
  accent:    '#6366F1',
  accentH:   '#4F46E5',
  success:   '#10B981',
  warning:   '#F59E0B',
  danger:    '#EF4444',
  border:    '#E2E8F0',
  muted:     '#94A3B8',
  gradient:  'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!username || !password) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    try {
      const result = await login(username, password);
      
      if (result.success) {
        if (result.user?.is_staff || result.user?.is_superuser) {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error || 'Identifiants incorrects');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      className="min-h-screen flex items-center py-6"
      style={{
        backgroundColor: T.bg,
        backgroundImage: `
          radial-gradient(circle at 30% 20%, ${alpha(T.accent, 0.04)} 0%, transparent 50%),
          radial-gradient(circle at 70% 80%, ${alpha('#A855F7', 0.04)} 0%, transparent 50%)
        `,
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={500}>
          <Paper
            elevation={0}
            className="p-7 md:p-10 rounded-2xl relative overflow-hidden"
            style={{ border: `1px solid ${T.border}` }}
          >
            {/* Bannière décorative */}
            <Box className="h-1 -mx-10 -mt-10 mb-0" style={{ background: T.gradient }} />

            {/* Logo / Marque */}
            <Box className="text-center mb-8 mt-4">
              <Box
                className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
                style={{
                  background: T.gradient,
                  boxShadow: `0 6px 20px ${alpha(T.accent, 0.3)}`,
                }}
              >
                <LoginIcon className="text-white text-2xl" />
              </Box>
              <Typography variant="h4" className="font-extrabold text-gray-800">
                Connexion
              </Typography>
              <Typography variant="body2" className="text-gray-400 mt-1.5">
                Connectez-vous à votre espace Madame Tibetia
              </Typography>
            </Box>

            {/* Alerte erreur */}
            {error && (
              <Alert
                severity="error"
                onClose={() => setError(null)}
                className="mb-6 rounded-xl"
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              {/* Identifiant */}
              <Box className="mb-5">
                <TextField
                  fullWidth
                  required
                  autoFocus
                  label="Nom d'utilisateur ou Email"
                  variant="outlined"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&.Mui-focused fieldset': { borderColor: T.accent },
                      '& fieldset': { borderColor: T.border },
                    },
                  }}
                />
              </Box>

              {/* Mot de passe */}
              <Box className="mb-6">
                <TextField
                  fullWidth
                  required
                  label="Mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="text-gray-400" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&.Mui-focused fieldset': { borderColor: T.accent },
                      '& fieldset': { borderColor: T.border },
                    },
                  }}
                />
              </Box>

              {/* Bouton de connexion */}
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                endIcon={
                  loading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <LoginIcon className="text-lg" />
                  )
                }
                className="rounded-xl py-3.5 font-bold text-sm normal-case"
                style={{
                  background: T.gradient,
                  boxShadow: `0 4px 14px ${alpha(T.accent, 0.35)}`,
                }}
                sx={{
                  '&:hover': {
                    boxShadow: `0 6px 20px ${alpha(T.accent, 0.45)}`,
                  },
                  '&:disabled': {
                    background: T.muted,
                    boxShadow: 'none',
                  },
                }}
              >
                {loading ? 'Connexion en cours…' : 'Se connecter'}
              </Button>
            </Box>

            {/* Lien inscription */}
            <Box className="mt-6 text-center">
              <Typography variant="body2" className="text-gray-400">
                Pas encore de compte ?{' '}
                <Link
                  to="/register"
                  className="text-indigo-500 font-bold no-underline hover:text-indigo-600 transition-colors"
                >
                  S'inscrire
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;