// frontend_public/src/components/QRCodePaiement.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
} from '@mui/material';
import { QrCode, Refresh, CheckCircle, AccessTime } from '@mui/icons-material';
import { paiementService } from '../services/paiementService';

const QRCodePaiement = ({ montant, moyenPaiementId, onPaiementConfirme }) => {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [paiementStatut, setPaiementStatut] = useState('EN_ATTENTE');
  const [reference, setReference] = useState(null);
  const intervalRef = useRef(null);
  const statutIntervalRef = useRef(null);

  // ✅ Générer le QR code
  const genererQR = async () => {
    setLoading(true);
    setError(null);
    setTimeRemaining(30);
    
    try {
      const response = await paiementService.genererQRCode(montant, moyenPaiementId);
      console.log('✅ QR Code généré:', response);
      setQrCode(response.qr_code);
      setReference(response.reference);
      setPaiementStatut('EN_ATTENTE');
      setLoading(false);
      
      // ✅ Démarrer le compteur
      startTimer();
      
      // ✅ Démarrer la vérification du statut
      startStatutVerification(response.reference);
      
    } catch (err) {
      console.error('❌ Erreur génération QR:', err);
      setError('Impossible de générer le QR code');
      setLoading(false);
    }
  };

  // ✅ Timer de 30 secondes
  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          // ✅ QR code expiré, régénérer automatiquement
          genererQR();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ✅ Vérification du statut du paiement
  const startStatutVerification = (ref) => {
    if (statutIntervalRef.current) clearInterval(statutIntervalRef.current);
    
    statutIntervalRef.current = setInterval(async () => {
      try {
        const response = await paiementService.verifierStatutPaiement(ref);
        console.log('📋 Statut paiement:', response.statut);
        
        if (response.statut === 'REUSSI') {
          setPaiementStatut('REUSSI');
          clearInterval(statutIntervalRef.current);
          clearInterval(intervalRef.current);
          if (onPaiementConfirme) {
            onPaiementConfirme(response);
          }
        } else if (response.statut === 'ECHOUE' || response.statut === 'ANNULE') {
          setPaiementStatut('ECHOUE');
          clearInterval(statutIntervalRef.current);
        }
      } catch (err) {
        console.error('❌ Erreur vérification statut:', err);
      }
    }, 3000); // Vérifier toutes les 3 secondes
  };

  // ✅ Nettoyer les intervalles
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (statutIntervalRef.current) clearInterval(statutIntervalRef.current);
    };
  }, []);

  // ✅ Générer le QR au montage
  useEffect(() => {
    genererQR();
  }, []);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress sx={{ color: '#2E7D32' }} />
        <Typography variant="body2" sx={{ mt: 2, color: '#666' }}>
          Génération du QR code...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={genererQR}
          sx={{ mt: 2 }}
        >
          Réessayer
        </Button>
      </Box>
    );
  }

  if (paiementStatut === 'REUSSI') {
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
    <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E8F5E9', textAlign: 'center' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1A1A', mb: 1 }}>
        📱 Scannez le QR code
      </Typography>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        Utilisez votre application de paiement mobile pour scanner le code
      </Typography>

      {/* QR Code */}
      <Box
        sx={{
          display: 'inline-block',
          p: 3,
          bgcolor: '#FFFFFF',
          borderRadius: 2,
          border: '1px solid #E8F5E9',
          position: 'relative',
        }}
      >
        {qrCode ? (
          <img
            src={`data:image/png;base64,${qrCode}`}
            alt="QR Code de paiement"
            style={{ width: 200, height: 200 }}
          />
        ) : (
          <Box sx={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F5F5F5' }}>
            <QrCode sx={{ fontSize: 80, color: '#BDBDBD' }} />
          </Box>
        )}
        
        {/* Timer */}
        <Box
          sx={{
            position: 'absolute',
            top: -10,
            right: -10,
            bgcolor: timeRemaining > 10 ? '#2E7D32' : '#EF4444',
            color: '#fff',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}
        >
          {timeRemaining}s
        </Box>
      </Box>

      {/* Montant */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 3 }}>
        <Chip
          label={`💰 ${montant} CFA`}
          sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 700 }}
        />
        <Chip
          icon={<AccessTime sx={{ fontSize: 16 }} />}
          label={`Expire dans ${timeRemaining}s`}
          sx={{ bgcolor: timeRemaining > 10 ? '#E8F5E9' : '#FFEBEE', color: timeRemaining > 10 ? '#2E7D32' : '#C62828' }}
        />
      </Box>

      {/* Référence */}
      <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#999' }}>
        Réf: {reference}
      </Typography>

      {/* Statut */}
      {paiementStatut === 'ECHOUE' && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
          Le paiement a échoué. Veuillez réessayer.
          <Button size="small" onClick={genererQR} sx={{ ml: 2 }}>
            Réessayer
          </Button>
        </Alert>
      )}

      <Button
        variant="outlined"
        size="small"
        startIcon={<Refresh />}
        onClick={genererQR}
        sx={{ mt: 2 }}
      >
        Régénérer le QR code
      </Button>
    </Paper>
  );
};

export default QRCodePaiement;