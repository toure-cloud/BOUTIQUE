// frontend_public/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Box,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from '@mui/icons-material';
import { authService } from '../services/authService';
import { logger } from '../lib/logger';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Si le client est déjà connecté, rediriger
  useEffect(() => {
    const token = localStorage.getItem('client_api_token');
    const clientData = localStorage.getItem('client_data');
    if (token && clientData) {
      navigate('/boutique');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.clientLogin(formData.email, formData.password);

      // ✅ Vérification stricte de la réponse
      if (!response.success) {
        setError(response.error || 'Identifiants incorrects');
        return;
      }

      if (!response.api_token) {
        setError('Le serveur n\'a pas renvoyé de token. Contactez le support.');
        logger.warn('Réponse login client sans api_token');
        return;
      }

      if (!response.client || !response.client.id) {
        setError('Données client manquantes dans la réponse.');
        logger.warn('Réponse login client sans client.id');
        return;
      }

      // ✅ Stockage COMPLET du client
      localStorage.setItem('client_api_token', response.api_token);
      localStorage.setItem('client_id', String(response.client.id));
      localStorage.setItem('client_data', JSON.stringify(response.client));

      logger.log('Login client réussi.');

      // Redirection
      navigate('/boutique');
    } catch (err) {
      logger.warn('Erreur login client, status:', err.response?.status);
      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          'Erreur de connexion. Vérifiez vos informations.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #F0F0F0' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>
          Bienvenue !
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', mb: 4 }}>
          Connectez-vous pour accéder à votre compte et passer vos commandes.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#999', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            fullWidth
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#999', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="Afficher / masquer le mot de passe"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 2,
              py: 1.4,
              bgcolor: '#1a1a1a',
              borderRadius: 50,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              '&:hover': { bgcolor: '#333' },
              '&.Mui-disabled': { bgcolor: '#555', color: '#fff' },
            }}
            startIcon={loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : null}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </Button>
        </form>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: '#1a1a1a', fontWeight: 600 }}>
              Créer un compte
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;