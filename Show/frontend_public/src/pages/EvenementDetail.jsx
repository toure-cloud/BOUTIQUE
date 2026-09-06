// src/pages/EvenementDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Chip,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Avatar,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack,
  CalendarToday,
  LocationOn,
  People,
  AttachMoney,
  CheckCircle,
  Cancel,
  Pending,
  Share,
  Favorite,
  FavoriteBorder,
  AccessTime,
  Email,
  Phone,
  Person,
  Send,
  Close,
  Event,
  Verified,
} from '@mui/icons-material';
import { evenementService } from '../services/evenementService';
import heroImage from '../assets/images/tibetia.jpeg';

const EvenementDetail = () => {
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [evenement, setEvenement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favori, setFavori] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchEvenement = async () => {
      try {
        setLoading(true);
        const data = await evenementService.getEvenementById(parseInt(id));
        console.log('📋 Événement reçu:', data);
        setEvenement(data);
        setError(null);
      } catch (err) {
        console.error('❌ Erreur:', err);
        setError('Impossible de charger les détails de l\'événement');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchEvenement();
    }
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: evenement?.titre,
        text: `Rejoignez-nous pour ${evenement?.titre}`,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      setSnackbarMessage('Lien copié dans le presse-papier !');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };

  const handleFavori = () => {
    setFavori(!favori);
    setSnackbarMessage(favori ? 'Retiré des favoris' : 'Ajouté aux favoris');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleOpenRegister = () => {
    setRegisterOpen(true);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      message: '',
    });
    setFormErrors({});
    setFormSubmitted(false);
  };
  
  const handleCloseRegister = () => {
    setRegisterOpen(false);
    setFormSubmitted(false);
    setFormData({ nom: '', prenom: '', email: '', telephone: '', message: '' });
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nom.trim()) errors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) errors.prenom = 'Le prénom est requis';
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email invalide';
    }
    if (!formData.telephone.trim()) errors.telephone = 'Le téléphone est requis';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ CORRECTION: Envoyer les données au backend
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      // ✅ Créer l'objet d'inscription
      const inscriptionData = {
        evenement: evenement.id,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        notes: formData.message || '',
      };
      
      console.log('📝 Envoi de l\'inscription:', inscriptionData);
      
      // ✅ Appel API pour s'inscrire
      const response = await evenementService.inscrireEvenement(inscriptionData);
      
      console.log('✅ Inscription réussie:', response);
      
      setFormSubmitted(true);
      setSnackbarMessage('✅ Inscription réussie ! Vous recevrez un email de confirmation.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Mettre à jour les places restantes
      if (response && response.places_restantes !== undefined) {
        setEvenement({
          ...evenement,
          places_restantes: response.places_restantes,
        });
      }
      
      setTimeout(() => {
        setRegisterOpen(false);
        setFormSubmitted(false);
        setFormData({ nom: '', prenom: '', email: '', telephone: '', message: '' });
      }, 2500);
      
    } catch (err) {
      console.error('❌ Erreur lors de l\'inscription:', err);
      
      let errorMessage = 'Erreur lors de l\'inscription. Veuillez réessayer.';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          const errors = err.response.data;
          const firstError = Object.values(errors)[0];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0];
          } else if (typeof firstError === 'string') {
            errorMessage = firstError;
          } else {
            errorMessage = errors.detail || errors.message || errors.error || errorMessage;
          }
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setSnackbarMessage(`❌ ${errorMessage}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatutInfo = (statut) => {
    const infos = {
      A_VENIR: { label: 'À venir', color: '#1976D2', icon: <Pending /> },
      EN_COURS: { label: 'En cours', color: '#2E7D32', icon: <CheckCircle /> },
      TERMINE: { label: 'Terminé', color: '#616161', icon: <CheckCircle /> },
      ANNULE: { label: 'Annulé', color: '#C62828', icon: <Cancel /> },
    };
    return infos[statut] || infos.A_VENIR;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#FFF5F3' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '16px', mb: 4 }} />
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Skeleton variant="text" height={40} />
              <Skeleton variant="text" height={200} />
              <Skeleton variant="text" height={100} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '16px' }} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error || !evenement) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          {error || 'Événement non trouvé'}
        </Alert>
        <Button
          component={Link}
          to="/evenements"
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Retour aux événements
        </Button>
      </Container>
    );
  }

  const statutInfo = getStatutInfo(evenement.statut);
  const placesDisponibles = evenement.places_restantes || 0;
  const placesTotal = evenement.places_total || 0;
  const pourcentage = placesTotal > 0 ? (placesDisponibles / placesTotal) * 100 : 0;
  const estComplet = placesDisponibles === 0;
  const estTermine = evenement.statut === 'TERMINE' || evenement.statut === 'ANNULE';
  const imageUrl = evenement.image ? `${import.meta.env.VITE_MEDIA_URL}${evenement.image}` : heroImage;

  return (
    <Box sx={{ bgcolor: '#FFF5F3', minHeight: '100vh' }}>
      {/* ===== HERO ===== */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '300px', md: '400px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: '#4A3728',
        }}
      >
        <Box
          component="img"
          src={imageUrl}
          alt={evenement.titre}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
            opacity: 0.3,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(74,55,40,0.8) 0%, rgba(74,55,40,0.3) 100%)',
          }}
        />

        <Box sx={{ position: 'absolute', top: 24, right: 24, zIndex: 2 }}>
          <Chip
            icon={statutInfo.icon}
            label={statutInfo.label}
            sx={{
              bgcolor: `${statutInfo.color}20`,
              color: statutInfo.color,
              fontWeight: 700,
              fontSize: '0.85rem',
              py: 1.5,
              px: 2,
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255,255,255,0.9)',
            }}
          />
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography
            variant="overline"
            sx={{
              color: '#FDE8E5',
              letterSpacing: 4,
              fontWeight: 600,
              fontSize: '0.75rem',
              display: 'block',
              mb: 2,
              opacity: 0.8,
            }}
          >
            {evenement.theme}
          </Typography>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 700,
              color: '#FFFFFF',
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
              mb: 2,
            }}
          >
            {evenement.titre}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 3,
              flexWrap: 'wrap',
              color: '#FDE8E5',
              opacity: 0.9,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday sx={{ fontSize: 18 }} />
              <Typography variant="body2">
                {formatDate(evenement.date_debut)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn sx={{ fontSize: 18 }} />
              <Typography variant="body2">{evenement.lieu}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <People sx={{ fontSize: 18 }} />
              <Typography variant="body2">
                {placesDisponibles} places restantes
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ===== CONTENU ===== */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ mb: 4 }}>
          <Button
            component={Link}
            to="/evenements"
            startIcon={<ArrowBack />}
            sx={{
              color: '#7A5A4A',
              '&:hover': { color: '#4A3728' },
            }}
          >
            Retour aux événements
          </Button>
        </Box>

        <Grid container spacing={4}>
          {/* ===== GAUCHE ===== */}
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 4,
                borderRadius: '16px',
                border: '1px solid #F5E8E5',
                boxShadow: 'none',
                mb: 3,
                bgcolor: '#FFFFFF',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontFamily: '"Playfair Display", serif',
                  mb: 2,
                  color: '#4A3728',
                }}
              >
                À propos de cet événement
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#7A5A4A',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-line',
                }}
              >
                {evenement.description}
              </Typography>
              {evenement.est_gratuit && (
                <Chip
                  label="🎉 Événement gratuit"
                  sx={{
                    mt: 2,
                    bgcolor: '#E8F5E9',
                    color: '#2E7D32',
                    fontWeight: 600,
                  }}
                />
              )}
            </Paper>

            <Paper
              sx={{
                p: 4,
                borderRadius: '16px',
                border: '1px solid #F5E8E5',
                boxShadow: 'none',
                bgcolor: '#FFFFFF',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: '#4A3728',
                }}
              >
                Informations pratiques
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#F5E8E5', color: '#4A3728' }}>
                      <CalendarToday />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999999', display: 'block' }}>
                        Date de début
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#4A3728' }}>
                        {formatDate(evenement.date_debut)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#F5E8E5', color: '#4A3728' }}>
                      <AccessTime />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999999', display: 'block' }}>
                        Date de fin
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#4A3728' }}>
                        {formatDate(evenement.date_fin)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#F5E8E5', color: '#4A3728' }}>
                      <LocationOn />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999999', display: 'block' }}>
                        Lieu
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#4A3728' }}>
                        {evenement.lieu}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#F5E8E5', color: '#4A3728' }}>
                      <AttachMoney />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999999', display: 'block' }}>
                        Prix
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#4A3728' }}>
                        {evenement.est_gratuit ? 'Gratuit' : `${evenement.prix} CFA`}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* ===== DROITE ===== */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '1px solid #F5E8E5',
                boxShadow: 'none',
                position: 'sticky',
                top: 100,
                bgcolor: '#FFFFFF',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontFamily: '"Playfair Display", serif',
                  mb: 2,
                  color: '#4A3728',
                }}
              >
                Réservation
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#7A5A4A' }}>
                    Places disponibles
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#4A3728' }}>
                    {placesDisponibles} / {placesTotal}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={pourcentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#F5E8E5',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: pourcentage > 50 ? '#4CAF50' : pourcentage > 25 ? '#FFA726' : '#EF5350',
                      borderRadius: 4,
                    },
                  }}
                />
                {estComplet && (
                  <Alert severity="warning" sx={{ mt: 2, borderRadius: '8px' }}>
                    ⚠️ Cet événement est complet !
                  </Alert>
                )}
                {estTermine && (
                  <Alert severity="info" sx={{ mt: 2, borderRadius: '8px' }}>
                    Cet événement est terminé.
                  </Alert>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleOpenRegister}
                  disabled={estComplet || estTermine}
                  sx={{
                    bgcolor: '#4A3728',
                    color: '#FFF5F3',
                    borderRadius: '50px',
                    py: 1.5,
                    '&:hover': { bgcolor: '#D4A5A0', color: '#4A3728' },
                    '&:disabled': { bgcolor: '#E8E0DD', color: '#B0A8A5' },
                  }}
                  startIcon={<Person />}
                >
                  {estComplet ? 'Complet' : estTermine ? 'Terminé' : 'Participer'}
                </Button>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleShare}
                    startIcon={<Share />}
                    sx={{
                      borderColor: '#D4A5A0',
                      color: '#4A3728',
                      borderRadius: '50px',
                      '&:hover': { borderColor: '#C08A85', bgcolor: 'rgba(212,165,160,0.08)' },
                    }}
                  >
                    Partager
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleFavori}
                    startIcon={favori ? <Favorite /> : <FavoriteBorder />}
                    sx={{
                      borderColor: '#D4A5A0',
                      color: favori ? '#E57373' : '#4A3728',
                      borderRadius: '50px',
                      '&:hover': { borderColor: '#C08A85', bgcolor: 'rgba(212,165,160,0.08)' },
                    }}
                  >
                    {favori ? 'Favori' : 'Ajouter'}
                  </Button>
                </Stack>
              </Stack>

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: '#FFF5F3',
                  borderRadius: '12px',
                }}
              >
                <Typography variant="caption" sx={{ color: '#999999', display: 'block' }}>
                  📌 Points clés
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ fontSize: 16, color: '#4CAF50' }} />
                    <Typography variant="body2" sx={{ color: '#7A5A4A', fontSize: '0.85rem' }}>
                      Confirmation immédiate
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ fontSize: 16, color: '#4CAF50' }} />
                    <Typography variant="body2" sx={{ color: '#7A5A4A', fontSize: '0.85rem' }}>
                      Accès prioritaire
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ fontSize: 16, color: '#4CAF50' }} />
                    <Typography variant="body2" sx={{ color: '#7A5A4A', fontSize: '0.85rem' }}>
                      Email de confirmation
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* ===== MODAL D'INSCRIPTION AVEC ENVOI API ===== */}
      <Dialog
        open={registerOpen}
        onClose={handleCloseRegister}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: { borderRadius: '16px', p: 1 },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontFamily: '"Playfair Display", serif',
                color: '#4A3728',
              }}
            >
              📝 Inscription
            </Typography>
            <IconButton onClick={handleCloseRegister}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }}>
            Vous vous inscrivez à : <strong>{evenement.titre}</strong>
            <br />
            <Typography variant="caption" sx={{ color: '#7A5A4A' }}>
              {formatDate(evenement.date_debut)} - {evenement.lieu}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#7A5A4A' }}>
              Places restantes : <strong>{placesDisponibles}</strong>
            </Typography>
          </Alert>

          {formSubmitted ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#4A3728' }}>
                Inscription réussie !
              </Typography>
              <Typography variant="body2" sx={{ color: '#7A5A4A' }}>
                Vous recevrez un email de confirmation avec tous les détails.
              </Typography>
              <Typography variant="caption" sx={{ color: '#7A5A4A', display: 'block', mt: 1 }}>
                Votre place est réservée pour cet événement.
              </Typography>
            </Box>
          ) : (
            <form onSubmit={handleFormSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom *"
                    name="nom"
                    value={formData.nom}
                    onChange={handleFormChange}
                    error={!!formErrors.nom}
                    helperText={formErrors.nom}
                    required
                    disabled={submitting}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: '#D4A5A0', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prénom *"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleFormChange}
                    error={!!formErrors.prenom}
                    helperText={formErrors.prenom}
                    required
                    disabled={submitting}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: '#D4A5A0', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    required
                    disabled={submitting}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: '#D4A5A0', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Téléphone *"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleFormChange}
                    error={!!formErrors.telephone}
                    helperText={formErrors.telephone}
                    required
                    disabled={submitting}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone sx={{ color: '#D4A5A0', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message / Questions"
                    name="message"
                    multiline
                    rows={3}
                    value={formData.message}
                    onChange={handleFormChange}
                    disabled={submitting}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Send sx={{ color: '#D4A5A0', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <DialogActions sx={{ px: 0, pt: 3 }}>
                <Button onClick={handleCloseRegister} disabled={submitting} sx={{ color: '#7A5A4A' }}>
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  sx={{
                    bgcolor: '#4A3728',
                    color: '#FFF5F3',
                    borderRadius: '50px',
                    px: 4,
                    '&:hover': { bgcolor: '#D4A5A0', color: '#4A3728' },
                    '&:disabled': { bgcolor: '#E8E0DD', color: '#B0A8A5' },
                  }}
                  startIcon={submitting ? <CircularProgress size={20} sx={{ color: '#FFF5F3' }} /> : <Send />}
                >
                  {submitting ? 'Inscription...' : 'S\'inscrire'}
                </Button>
              </DialogActions>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== SNACKBAR ===== */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%', borderRadius: '12px' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EvenementDetail;