// frontend_public/src/components/PaiementCarte.jsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  Divider,
  Chip,
} from '@mui/material';
import {
  CreditCard,
  Person,
  CalendarToday,
  Lock,
  CheckCircle,
  Security,
} from '@mui/icons-material';
import { paiementService } from '../services/paiementService';

const PaiementCarte = ({ montant, inscriptionId, onPaiementConfirme }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    numero: '',
    titulaire: '',
    expiration: '',
    cvv: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // ✅ Formatage du numéro de carte (XXXX XXXX XXXX XXXX)
    if (name === 'numero') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
    }
    
    // ✅ Formatage de la date d'expiration (MM/AA)
    if (name === 'expiration') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      if (formattedValue.length > 5) formattedValue = formattedValue.slice(0, 5);
    }
    
    // ✅ CVV (3-4 chiffres)
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 4) formattedValue = formattedValue.slice(0, 4);
    }
    
    setFormData({ ...formData, [name]: formattedValue });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
    setError(null);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.numero.trim() || formData.numero.replace(/\s/g, '').length < 16) {
      errors.numero = 'Numéro de carte invalide (16 chiffres)';
    }
    if (!formData.titulaire.trim()) {
      errors.titulaire = 'Le nom du titulaire est requis';
    }
    if (!formData.expiration.trim() || formData.expiration.length < 5) {
      errors.expiration = 'Date d\'expiration invalide (MM/AA)';
    }
    if (!formData.cvv.trim() || formData.cvv.length < 3) {
      errors.cvv = 'CVV invalide (3-4 chiffres)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await paiementService.paiementCarte({
        inscription: inscriptionId,
        numero_carte: formData.numero.replace(/\s/g, ''),
        titulaire: formData.titulaire,
        expiration: formData.expiration,
        cvv: formData.cvv,
        montant: montant,
      });
      
      console.log('✅ Paiement carte réussi:', response);
      
      setSuccess(true);
      if (onPaiementConfirme) {
        setTimeout(() => {
          onPaiementConfirme(response);
        }, 1500);
      }
    } catch (err) {
      console.error('❌ Erreur paiement carte:', err);
      setError(err.response?.data?.error || 'Erreur lors du paiement par carte');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CheckCircle sx={{ fontSize: 64, color: '#2E7D32', mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1A1A1A' }}>
          ✅ Paiement confirmé !
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
          Votre paiement a été validé avec succès.
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E8F5E9' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1A1A' }}>
          💳 Paiement par carte
        </Typography>
        <Chip
          icon={<Security sx={{ fontSize: 16 }} />}
          label="Paiement sécurisé"
          size="small"
          sx={{ bgcolor: '#E8F5E9', color: '#2E7D32' }}
        />
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        🔒 Vos informations sont sécurisées et cryptées.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Numéro de carte"
          name="numero"
          value={formData.numero}
          onChange={handleChange}
          error={!!formErrors.numero}
          helperText={formErrors.numero}
          placeholder="1234 5678 9012 3456"
          sx={{ mb: 2.5 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <CreditCard sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
            },
          }}
        />

        <TextField
          fullWidth
          label="Titulaire de la carte"
          name="titulaire"
          value={formData.titulaire}
          onChange={handleChange}
          error={!!formErrors.titulaire}
          helperText={formErrors.titulaire}
          placeholder="Jean Dupont"
          sx={{ mb: 2.5 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
            },
          }}
        />

        <Grid container spacing={2}>
          <Grid item xs={8}>
            <TextField
              fullWidth
              label="Date d'expiration"
              name="expiration"
              value={formData.expiration}
              onChange={handleChange}
              error={!!formErrors.expiration}
              helperText={formErrors.expiration}
              placeholder="MM/AA"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday sx={{ color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="CVV"
              name="cvv"
              value={formData.cvv}
              onChange={handleChange}
              error={!!formErrors.cvv}
              helperText={formErrors.cvv}
              placeholder="123"
              type="password"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Total à payer : <strong style={{ color: '#1A1A1A' }}>{montant} CFA</strong>
          </Typography>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: '#2E7D32',
              color: '#FFFFFF',
              borderRadius: 50,
              px: 4,
              py: 1.5,
              fontWeight: 700,
              '&:hover': { bgcolor: '#1B5E20' },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#FFFFFF' }} /> : 'Payer'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default PaiementCarte;