// frontend_public/src/pages/FormationLive.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  ScreenShare,
  StopScreenShare,
  Chat,
  People,
  Fullscreen,
  ExitToApp,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';

const FormationLive = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [formation, setFormation] = useState(null);
  const [error, setError] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [participants, setParticipants] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  
  // ✅ États pour le contrôle admin
  const [adminControls, setAdminControls] = useState({
    micAllowed: true,
    cameraAllowed: true,
    canShareScreen: true,
    isMutedByAdmin: false,
    isCameraBlockedByAdmin: false,
  });

  useEffect(() => {
    // Récupérer les données de la formation depuis sessionStorage
    const accessData = sessionStorage.getItem('formation_access');
    if (!accessData) {
      navigate('/verifier-code');
      return;
    }

    try {
      const data = JSON.parse(accessData);
      // Vérifier si la session est encore valide (30 minutes)
      if (Date.now() - data.timestamp > 30 * 60 * 1000) {
        sessionStorage.removeItem('formation_access');
        navigate('/verifier-code');
        return;
      }
      setFormation(data.formation);
      setParticipants(Math.floor(Math.random() * 20) + 5);
    } catch (e) {
      navigate('/verifier-code');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Simuler les contrôles admin (WebSocket simulation)
  useEffect(() => {
    // Simulation des messages admin
    const interval = setInterval(() => {
      // Simuler une action admin aléatoire (pour démonstration)
      const actions = [
        { micAllowed: false, message: '🔇 Le microphone a été désactivé par l\'admin' },
        { cameraAllowed: false, message: '📹 La caméra a été désactivée par l\'admin' },
        { micAllowed: true, cameraAllowed: true, message: '✅ Contrôles réactivés par l\'admin' },
      ];
      
      // Simulation (désactivée pour ne pas perturber)
      // Vous pouvez activer pour tester
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const toggleMic = () => {
    if (!adminControls.micAllowed || adminControls.isMutedByAdmin) {
      return;
    }
    setIsMicOn(!isMicOn);
  };

  const toggleCamera = () => {
    if (!adminControls.cameraAllowed || adminControls.isCameraBlockedByAdmin) {
      return;
    }
    setIsCameraOn(!isCameraOn);
  };

  const toggleScreenShare = () => {
    if (!adminControls.canShareScreen) return;
    setIsScreenSharing(!isScreenSharing);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleExit = () => {
    setExitDialogOpen(true);
  };

  const confirmExit = () => {
    sessionStorage.removeItem('formation_access');
    navigate('/');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress sx={{ color: '#2E7D32' }} />
      </Box>
    );
  }

  if (error || !formation) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          {error || 'Formation non disponible'}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} sx={{ mt: 3 }}>
          Retour à l'accueil
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#0A0A0A', minHeight: '100vh', color: '#FFFFFF' }}>
      {/* Barre de contrôle supérieure */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          bgcolor: '#1A1A1A',
          borderBottom: '1px solid #2A2A2A',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/')} sx={{ color: '#FFFFFF' }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {formation.titre}
          </Typography>
          <Chip
            label="🔴 EN DIRECT"
            size="small"
            sx={{ bgcolor: '#E53935', color: '#FFFFFF', fontWeight: 700 }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<People sx={{ fontSize: 16 }} />}
            label={`${participants} participants`}
            size="small"
            sx={{ bgcolor: '#2A2A2A', color: '#FFFFFF' }}
          />
          <Tooltip title="Participants">
            <IconButton sx={{ color: '#FFFFFF' }}>
              <People />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chat">
            <IconButton sx={{ color: '#FFFFFF' }}>
              <Chat />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Vidéo principale */}
      <Box
        sx={{
          position: 'relative',
          height: 'calc(100vh - 160px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#0A0A0A',
        }}
      >
        {/* Vidéo simulée */}
        <Box
          sx={{
            width: '90%',
            maxWidth: '1200px',
            height: '80%',
            bgcolor: '#1A1A1A',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Image par défaut */}
          <Box
            component="img"
            src={formation.image || 'https://images.unsplash.com/photo-1571781926291-c77df8097c1f?w=1200&q=80'}
            alt={formation.titre}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.3,
            }}
          />
          
          {/* Contrôles admin - Message si bloqué */}
          {(!adminControls.micAllowed || !adminControls.cameraAllowed) && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'rgba(0,0,0,0.8)',
                p: 4,
                borderRadius: '16px',
                textAlign: 'center',
                maxWidth: 400,
              }}
            >
              {!adminControls.micAllowed && !adminControls.cameraAllowed && (
                <>
                  <Cancel sx={{ fontSize: 48, color: '#EF4444', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    🚫 Micro et caméra désactivés
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    L'administrateur a désactivé votre micro et votre caméra.
                    Veuillez attendre la réactivation.
                  </Typography>
                </>
              )}
              {!adminControls.micAllowed && adminControls.cameraAllowed && (
                <>
                  <MicOff sx={{ fontSize: 48, color: '#EF4444', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    🔇 Micro désactivé
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    L'administrateur a désactivé votre microphone.
                  </Typography>
                </>
              )}
              {adminControls.micAllowed && !adminControls.cameraAllowed && (
                <>
                  <VideocamOff sx={{ fontSize: 48, color: '#EF4444', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    📹 Caméra désactivée
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    L'administrateur a désactivé votre caméra.
                  </Typography>
                </>
              )}
            </Box>
          )}

          {/* Indicateur de statut */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              display: 'flex',
              gap: 1,
            }}
          >
            {isMicOn && adminControls.micAllowed ? (
              <Chip
                icon={<Mic sx={{ fontSize: 16 }} />}
                label="Micro actif"
                size="small"
                sx={{ bgcolor: '#2E7D32', color: '#FFFFFF' }}
              />
            ) : (
              <Chip
                icon={<MicOff sx={{ fontSize: 16 }} />}
                label="Micro désactivé"
                size="small"
                sx={{ bgcolor: '#C62828', color: '#FFFFFF' }}
              />
            )}
            {isCameraOn && adminControls.cameraAllowed ? (
              <Chip
                icon={<Videocam sx={{ fontSize: 16 }} />}
                label="Caméra active"
                size="small"
                sx={{ bgcolor: '#2E7D32', color: '#FFFFFF' }}
              />
            ) : (
              <Chip
                icon={<VideocamOff sx={{ fontSize: 16 }} />}
                label="Caméra désactivée"
                size="small"
                sx={{ bgcolor: '#C62828', color: '#FFFFFF' }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Barre de contrôle inférieure */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 3,
          p: 2.5,
          bgcolor: '#1A1A1A',
          borderTop: '1px solid #2A2A2A',
        }}
      >
        {/* Micro */}
        <Tooltip title={isMicOn ? 'Désactiver le micro' : 'Activer le micro'}>
          <IconButton
            onClick={toggleMic}
            sx={{
              color: isMicOn ? '#FFFFFF' : '#EF4444',
              bgcolor: isMicOn ? 'transparent' : 'rgba(239, 68, 68, 0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              disabled: !adminControls.micAllowed || adminControls.isMutedByAdmin,
            }}
          >
            {isMicOn ? <Mic fontSize="large" /> : <MicOff fontSize="large" />}
          </IconButton>
        </Tooltip>

        {/* Caméra */}
        <Tooltip title={isCameraOn ? 'Désactiver la caméra' : 'Activer la caméra'}>
          <IconButton
            onClick={toggleCamera}
            sx={{
              color: isCameraOn ? '#FFFFFF' : '#EF4444',
              bgcolor: isCameraOn ? 'transparent' : 'rgba(239, 68, 68, 0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              disabled: !adminControls.cameraAllowed || adminControls.isCameraBlockedByAdmin,
            }}
          >
            {isCameraOn ? <Videocam fontSize="large" /> : <VideocamOff fontSize="large" />}
          </IconButton>
        </Tooltip>

        {/* Partage d'écran */}
        <Tooltip title={isScreenSharing ? 'Arrêter le partage' : 'Partager l\'écran'}>
          <IconButton
            onClick={toggleScreenShare}
            sx={{
              color: isScreenSharing ? '#4CAF50' : '#FFFFFF',
              bgcolor: isScreenSharing ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              disabled: !adminControls.canShareScreen,
            }}
          >
            {isScreenSharing ? <StopScreenShare fontSize="large" /> : <ScreenShare fontSize="large" />}
          </IconButton>
        </Tooltip>

        {/* Plein écran */}
        <Tooltip title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}>
          <IconButton
            onClick={toggleFullscreen}
            sx={{ color: '#FFFFFF', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            <Fullscreen fontSize="large" />
          </IconButton>
        </Tooltip>

        {/* Quitter */}
        <Tooltip title="Quitter la formation">
          <IconButton
            onClick={handleExit}
            sx={{ color: '#EF4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}
          >
            <ExitToApp fontSize="large" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Dialog de confirmation de sortie */}
      <Dialog open={exitDialogOpen} onClose={() => setExitDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Quitter la formation</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir quitter la formation ?
            Vous pourrez y revenir avec votre code d'accès.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExitDialogOpen(false)}>Annuler</Button>
          <Button onClick={confirmExit} variant="contained" sx={{ bgcolor: '#EF4444' }}>
            Quitter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormationLive;