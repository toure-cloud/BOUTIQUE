// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container, Paper, Typography, TextField, Button, Alert,
  Box, InputAdornment, IconButton, Fade, CircularProgress, alpha,
} from '@mui/material';
import {
  Visibility, VisibilityOff, Email, Lock, Login as LoginIcon,
  ArrowForward,
} from '@mui/icons-material';

// ═══════════════════════════════════════════════════════════════════════════════
// PALETTE SOMBRE PREMIUM — Madame Tibetia
// ═══════════════════════════════════════════════════════════════════════════════
const T = {
  bg:          '#0B0F19',
  surface:     '#111827',
  surfaceElev: '#1F2937',
  primary:     '#F9FAFB',
  secondary:   '#D1D5DB',
  muted:       '#9CA3AF',
  accent:      '#8B5CF6',
  accentH:     '#A78BFA',
  accentSoft:  'rgba(139, 92, 246, 0.15)',
  border:      'rgba(255, 255, 255, 0.08)',
  danger:      '#F87171',
  gradient:    'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #C026D3 100%)',
  gradientSoft:'linear-gradient(135deg, rgba(124, 58, 237, 0.25) 0%, rgba(192, 38, 211, 0.15) 100%)',
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
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 5, md: 8 },
        px: 2,
        backgroundColor: T.bg,
        backgroundImage: `
          radial-gradient(ellipse 90% 60% at 15% 20%, ${alpha('#7C3AED', 0.18)} 0%, transparent 55%),
          radial-gradient(ellipse 70% 50% at 85% 80%, ${alpha('#C026D3', 0.12)} 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, ${alpha('#8B5CF6', 0.06)} 0%, transparent 70%)
        `,
      }}
    >
      <Container maxWidth="sm" disableGutters>
        <Fade in timeout={700}>
          <Paper
            elevation={0}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '28px',
              border: `1px solid ${T.border}`,
              backgroundColor: T.surface,
              boxShadow: `
                0 25px 50px -12px ${alpha('#000', 0.5)},
                0 0 0 1px ${alpha('#fff', 0.03)}
              `,
              px: { xs: 3.5, sm: 5.5 },
              py: { xs: 5, sm: 6 },
            }}
          >
            {/* Accent line top */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: T.gradient,
              }}
            />

            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '22px',
                  mx: 'auto',
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: T.gradient,
                  boxShadow: `0 12px 32px ${alpha('#7C3AED', 0.45)}`,
                }}
              >
                <LoginIcon sx={{ color: '#fff', fontSize: 34 }} />
              </Box>

              <Typography
                sx={{
                  fontWeight: 800,
                  color: T.primary,
                  letterSpacing: '-0.04em',
                  fontSize: { xs: '1.85rem', sm: '2.15rem' },
                  lineHeight: 1.15,
                }}
              >
                Connexion
              </Typography>
              <Typography
                sx={{
                  mt: 1.5,
                  color: T.muted,
                  fontSize: '0.975rem',
                  fontWeight: 400,
                }}
              >
                Accédez à votre espace Madame Tibetia
              </Typography>
            </Box>

            {/* Error */}
            {error && (
              <Alert
                severity="error"
                onClose={() => setError(null)}
                sx={{
                  mb: 3.5,
                  borderRadius: '16px',
                  border: `1px solid ${alpha(T.danger, 0.3)}`,
                  bgcolor: alpha(T.danger, 0.1),
                  color: T.danger,
                  '& .MuiAlert-icon': { color: T.danger },
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              {/* Username / Email */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  component="label"
                  sx={{
                    display: 'block',
                    mb: 1.25,
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: T.secondary,
                    letterSpacing: '0.02em',
                  }}
                >
                  Nom d'utilisateur ou Email
                </Typography>
                <TextField
                  fullWidth
                  required
                  autoFocus
                  placeholder="ex. : marie@email.com"
                  variant="outlined"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: T.muted, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      bgcolor: alpha('#000', 0.25),
                      color: T.primary,
                      transition: 'all 0.2s ease',
                      '& fieldset': {
                        borderColor: T.border,
                        borderWidth: '1.5px',
                      },
                      '&:hover fieldset': {
                        borderColor: alpha(T.accent, 0.45),
                      },
                      '&.Mui-focused': {
                        bgcolor: alpha('#000', 0.35),
                        boxShadow: `0 0 0 3px ${alpha(T.accent, 0.2)}`,
                        '& fieldset': {
                          borderColor: T.accent,
                          borderWidth: '1.5px',
                        },
                      },
                    },
                    '& .MuiInputBase-input': {
                      py: 1.7,
                      fontSize: '0.95rem',
                      '&::placeholder': {
                        color: T.muted,
                        opacity: 0.7,
                      },
                    },
                  }}
                />
              </Box>

              {/* Password */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  component="label"
                  sx={{
                    display: 'block',
                    mb: 1.25,
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: T.secondary,
                    letterSpacing: '0.02em',
                  }}
                >
                  Mot de passe
                </Typography>
                <TextField
                  fullWidth
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  variant="outlined"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: T.muted, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                          sx={{
                            color: T.muted,
                            mr: 0.5,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              color: T.accentH,
                              bgcolor: alpha(T.accent, 0.15),
                            },
                          }}
                        >
                          {showPassword ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      bgcolor: alpha('#000', 0.25),
                      color: T.primary,
                      transition: 'all 0.2s ease',
                      '& fieldset': {
                        borderColor: T.border,
                        borderWidth: '1.5px',
                      },
                      '&:hover fieldset': {
                        borderColor: alpha(T.accent, 0.45),
                      },
                      '&.Mui-focused': {
                        bgcolor: alpha('#000', 0.35),
                        boxShadow: `0 0 0 3px ${alpha(T.accent, 0.2)}`,
                        '& fieldset': {
                          borderColor: T.accent,
                          borderWidth: '1.5px',
                        },
                      },
                    },
                    '& .MuiInputBase-input': {
                      py: 1.7,
                      fontSize: '0.95rem',
                      '&::placeholder': {
                        color: T.muted,
                        opacity: 0.7,
                      },
                    },
                  }}
                />
              </Box>

              {/* Submit button */}
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                endIcon={
                  loading ? (
                    <CircularProgress size={18} color="inherit" thickness={5} />
                  ) : (
                    <ArrowForward sx={{ fontSize: 18 }} />
                  )
                }
                sx={{
                  py: 1.85,
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontSize: '0.975rem',
                  textTransform: 'none',
                  letterSpacing: '0.02em',
                  background: T.gradient,
                  boxShadow: `0 8px 24px ${alpha('#7C3AED', 0.4)}`,
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    boxShadow: `0 12px 32px ${alpha('#7C3AED', 0.55)}`,
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&.Mui-disabled': {
                    background: alpha('#fff', 0.12),
                    boxShadow: 'none',
                    color: alpha('#fff', 0.4),
                  },
                }}
              >
                {loading ? 'Connexion en cours…' : 'Se connecter'}
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;