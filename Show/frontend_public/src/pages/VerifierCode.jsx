// frontend_public/src/pages/VerifierCode.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  Avatar,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  QrCode,
  Email,
  CheckCircle,
  ArrowBack,
  Lock,
  Verified,
} from '@mui/icons-material';
import { formationService } from '../services/formationService';

const VerifierCode = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formationData, setFormationData] = useState(null);
  
  const [formData, setFormData] = useState({
    email: '',
    code: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.code) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Appeler l'API pour vérifier le code
      const response = await formationService.verifierCode({
        email: formData.email,
        code: formData.code.toUpperCase(),
      });

      console.log('✅ Code vérifié:', response);
      
      setSuccess(true);
      setFormationData(response.formation);
      
      // Stocker les infos pour la session
      sessionStorage.setItem('formation_access', JSON.stringify({
        formation: response.formation,
        client: response.client,
        code: response.code_acces,
        timestamp: Date.now(),
      }));
      
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err.response?.data?.error || 'Code d\'accès invalide');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessFormation = () => {
    navigate(`/formation/${formationData?.id}/live`);
  };

  if (success && formationData) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 5, borderRadius: '16px', textAlign: 'center' }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: '#E8F5E9', color: '#2E7D32', mx: 'auto', mb: 3 }}>
            <Verified sx={{ fontSize: 48 }} />
          </Avatar>
          
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A1A1A', mb: 1 }}>
            ✅ Accès autorisé
          </Typography>
          <Typography variant="body1" sx={{ color: '#666666', mb: 3 }}>
            Vous avez accès à la formation <strong>"{formationData.titre}"</strong>
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={handleAccessFormation}
              sx={{
                bgcolor: '#2E7D32',
                color: '#FFFFFF',
                borderRadius: '50px',
                px: 4,
                py: 1.5,
                '&:hover': { bgcolor: '#1B5E20' },
              }}
            >
              Accéder à la formation
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              sx={{ borderRadius: '50px', px: 4 }}
            >
              Retour à l'accueil
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, color: '#666666' }}
      >
        Retour
      </Button>

      <Paper sx={{ p: 4, borderRadius: '16px', border: '1px solid #E8F5E9' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: '#E8F5E9', color: '#2E7D32', mx: 'auto', mb: 2 }}>
            <Lock sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1A1A1A' }}>
            Vérifier votre code d'accès
          </Typography>
          <Typography variant="body2" sx={{ color: '#666666' }}>
            Entrez votre email et le code d'accès reçu
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            sx={{ mb: 2.5 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            fullWidth
            label="Code d'accès *"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Ex: ABC123XYZ9"
            helperText="Le code d'accès vous a été envoyé par email"
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <QrCode sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: '#2E7D32',
              color: '#FFFFFF',
              borderRadius: '50px',
              py: 1.5,
              fontWeight: 700,
              '&:hover': { bgcolor: '#1B5E20' },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#FFFFFF' }} /> : 'Vérifier'}
          </Button>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            Vous n'avez pas reçu de code ? Contactez le support.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default VerifierCode;