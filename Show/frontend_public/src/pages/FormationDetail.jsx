// src/pages/FormationDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Paper,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Fade,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Payment,
  Person,
  Email,
  Phone,
  CalendarToday,
  AccessTime,
  AttachMoney,
  Check,
  PlayArrow,
  LiveTv,
  Replay,
  EventNote,
  CreditCard,
  PhoneAndroid,
  QrCode,
  Notes,
} from '@mui/icons-material';
import { formationService } from '../services/formationService';
import { paiementService } from '../services/paiementService';
import heroImage from '../assets/images/tibetia.jpeg';

// Icônes pour les moyens de paiement
const PAIEMENT_ICONS = {
  WAVE: <QrCode sx={{ fontSize: 28 }} />,
  ORANGE_MONEY: <PhoneAndroid sx={{ fontSize: 28 }} />,
  MOOV_MONEY: <PhoneAndroid sx={{ fontSize: 28 }} />,
  MTN_MONEY: <PhoneAndroid sx={{ fontSize: 28 }} />,
  CARTE_BANCAIRE: <CreditCard sx={{ fontSize: 28 }} />,
};

const FormationDetail = () => {
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formation, setFormation] = useState(null);
  const [moyensPaiement, setMoyensPaiement] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Formulaire d'inscription
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Étapes
  const [activeStep, setActiveStep] = useState(0);
  const [inscriptionId, setInscriptionId] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [codeAcces, setCodeAcces] = useState(null);
  const [paiementEffectue, setPaiementEffectue] = useState(false);

  // Paiement
  const [moyenPaiementSelected, setMoyenPaiementSelected] = useState('');
  const [numeroPaiement, setNumeroPaiement] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [processingPaiement, setProcessingPaiement] = useState(false);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [formationData, moyensData] = await Promise.all([
          formationService.getFormationById(parseInt(id)),
          paiementService.getMoyensPaiement(),
        ]);
        setFormation(formationData);

        const moyensList = Array.isArray(moyensData) ? moyensData : moyensData.results || [];
        setMoyensPaiement(moyensList);

        setError(null);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: null,
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nom.trim()) errors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) errors.prenom = 'Le prénom est requis';
    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email invalide';
    }
    if (!formData.telephone.trim()) errors.telephone = 'Le téléphone est requis';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInscription = async () => {
    if (!validateForm()) return;

    try {
      const response = await formationService.inscrire(parseInt(id), formData.notes);
      setInscriptionId(response.id);
      setActiveStep(1);
      setSnackbarMessage('Inscription enregistrée ! Choisissez votre moyen de paiement.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Erreur d'inscription:", err);
      setSnackbarMessage("Erreur lors de l'inscription");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handlePaiement = async () => {
    if (!moyenPaiementSelected) {
      setSnackbarMessage('Veuillez sélectionner un moyen de paiement');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    setConfirmDialogOpen(true);
  };

  const handleConfirmerPaiement = async () => {
    setConfirmDialogOpen(false);
    setProcessingPaiement(true);

    try {
      const transactionData = {
        inscription: inscriptionId,
        moyen_paiement: parseInt(moyenPaiementSelected),
        montant: formation.prix,
        numero_transaction: numeroPaiement || 'SIMULATION-' + Date.now(),
        details: {
          moyen:
            Array.isArray(moyensPaiement) &&
            moyensPaiement.find((m) => m.id === parseInt(moyenPaiementSelected))?.type,
          numero: numeroPaiement || 'Simulation',
          date: new Date().toISOString(),
        },
      };

      const transaction = await paiementService.creerTransaction(transactionData);
      setTransactionId(transaction.id);

      setTimeout(async () => {
        try {
          const confirmation = await paiementService.confirmerPaiement(transaction.id);
          setCodeAcces(confirmation);
          setPaiementEffectue(true);
          setActiveStep(2);
          setProcessingPaiement(false);
          setSnackbarMessage("✅ Paiement effectué ! Code d'accès généré.");
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        } catch (err) {
          console.error('Erreur de confirmation:', err);
          setProcessingPaiement(false);
          setSnackbarMessage('Erreur lors de la confirmation du paiement');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      }, 2000);
    } catch (err) {
      console.error('Erreur de paiement:', err);
      setProcessingPaiement(false);
      setSnackbarMessage('Erreur lors du paiement');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const getStatutChip = (formation) => {
    if (formation.est_live) {
      return (
        <Chip
          icon={<LiveTv sx={{ fontSize: 16, color: '#fff' }} />}
          label="EN DIRECT"
          sx={{
            backgroundColor: '#E53935',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: 0.8,
            height: 32,
            px: 1,
            '& .MuiChip-icon': { color: '#fff' },
          }}
        />
      );
    }
    if (formation.est_replay) {
      return (
        <Chip
          icon={<Replay sx={{ fontSize: 16 }} />}
          label="REPLAY DISPONIBLE"
          sx={{
            backgroundColor: '#1A1A1A',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: 0.5,
            height: 32,
          }}
        />
      );
    }
    return (
      <Chip
        icon={<EventNote sx={{ fontSize: 16 }} />}
        label="PROGRAMMÉ"
        sx={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          color: '#FFFFFF',
          fontWeight: 600,
          fontSize: '0.75rem',
          letterSpacing: 0.5,
          height: 32,
          backdropFilter: 'blur(8px)',
        }}
      />
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
        }}
      >
        <CircularProgress sx={{ color: '#2C2C2C' }} thickness={4} />
      </Box>
    );
  }

  if (error || !formation) {
    return (
      <Container sx={{ py: 10 }}>
        <Alert severity="error" sx={{ borderRadius: 3, mb: 3 }}>
          {error || 'Formation non trouvée'}
        </Alert>
        <Button component={Link} to="/" startIcon={<ArrowBack />} variant="outlined">
          Retour à l'accueil
        </Button>
      </Container>
    );
  }

  const steps = ['Inscription', 'Paiement', 'Accès'];

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      {/* ===== HERO ===== */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 240, md: 340 },
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
          backgroundColor: '#1A1A1A',
        }}
      >
        <Box
          component="img"
          src={
            formation.image
              ? `${import.meta.env.VITE_MEDIA_URL}${formation.image}`
              : heroImage
          }
          alt={formation.titre}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 25%',
            opacity: 0.45,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(20,20,20,0.95) 0%, rgba(20,20,20,0.55) 45%, rgba(20,20,20,0.3) 100%)',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pb: { xs: 4, md: 5 } }}>
          <Typography
            variant="overline"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: 3.5,
              fontWeight: 600,
              fontSize: '0.7rem',
              display: 'block',
              mb: 1.5,
            }}
          >
            FORMATION EN LIGNE
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: '#FFFFFF',
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '1.9rem', sm: '2.4rem', md: '3.1rem' },
              lineHeight: 1.15,
              mb: 2.5,
              maxWidth: 780,
            }}
          >
            {formation.titre}
          </Typography>

          <Box>{getStatutChip(formation)}</Box>
        </Container>
      </Box>

      {/* ===== CONTENU ===== */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBack />}
          sx={{
            mb: 4,
            color: '#666',
            fontWeight: 500,
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
          }}
        >
          Retour à l'accueil
        </Button>

        <Grid container spacing={4}>
          {/* ===== COLONNE GAUCHE : DÉTAILS ===== */}
          <Grid item xs={12} md={7}>
            {/* Description */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid #EEEEEE',
                mb: 3,
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 2.5,
                    fontFamily: '"Playfair Display", serif',
                    color: '#1A1A1A',
                  }}
                >
                  Description
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#555',
                    whiteSpace: 'pre-line',
                    lineHeight: 1.85,
                    fontSize: '1.02rem',
                  }}
                >
                  {formation.description_detail || formation.description}
                </Typography>

                {/* Points d'apprentissage */}
                {formation.description_detail?.split('\n').filter((s) => s.trim().startsWith('•'))
                  .length > 0 && (
                  <>
                    <Divider sx={{ my: 3.5 }} />
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 2.5,
                        fontFamily: '"Playfair Display", serif',
                        color: '#1A1A1A',
                      }}
                    >
                      Ce que vous allez apprendre
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {formation.description_detail
                        ?.split('\n')
                        .filter((s) => s.trim().startsWith('•'))
                        .map((point, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 1.5,
                            }}
                          >
                            <Box
                              sx={{
                                mt: 0.3,
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                backgroundColor: '#E8F5E9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <Check sx={{ color: '#2E7D32', fontSize: 15 }} />
                            </Box>
                            <Typography
                              variant="body1"
                              sx={{ color: '#444', lineHeight: 1.6 }}
                            >
                              {point.replace('•', '').trim()}
                            </Typography>
                          </Box>
                        ))}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Infos clés */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                border: '1px solid #EEEEEE',
                backgroundColor: '#fff',
              }}
            >
              <Grid container spacing={2}>
                {[
                  {
                    icon: <AttachMoney sx={{ fontSize: 26, color: '#666' }} />,
                    label: 'Prix',
                    value: formation.prix_formate || `${formation.prix} CFA`,
                  },
                  {
                    icon: <AccessTime sx={{ fontSize: 26, color: '#666' }} />,
                    label: 'Durée',
                    value: formation.duree,
                  },
                  {
                    icon: <CalendarToday sx={{ fontSize: 26, color: '#666' }} />,
                    label: 'Date',
                    value: formation.date_live
                      ? new Date(formation.date_live).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'À définir',
                  },
                  {
                    icon: <AccessTime sx={{ fontSize: 26, color: '#666' }} />,
                    label: 'Horaire',
                    value: formation.date_live
                      ? new Date(formation.date_live).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'À définir',
                  },
                ].map((item, idx) => (
                  <Grid item xs={6} sm={3} key={idx}>
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 1.5,
                        px: 1,
                        borderRadius: 2,
                        transition: 'background 0.2s',
                        '&:hover': { backgroundColor: '#FAFAFA' },
                      }}
                    >
                      {item.icon}
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#999',
                          display: 'block',
                          mt: 1,
                          fontWeight: 500,
                          letterSpacing: 0.3,
                        }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: '#1A1A1A',
                          mt: 0.3,
                          fontSize: { xs: '0.95rem', md: '1.05rem' },
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* ===== COLONNE DROITE : INSCRIPTION / PAIEMENT / ACCÈS ===== */}
          <Grid item xs={12} md={5}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid #EEEEEE',
                position: 'sticky',
                top: 90,
                boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 3.5 } }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    fontFamily: '"Playfair Display", serif',
                    color: '#1A1A1A',
                  }}
                >
                  {paiementEffectue ? 'Accès autorisé' : 'Inscription'}
                </Typography>

                {/* Stepper custom */}
                <Stepper
                  activeStep={activeStep}
                  orientation="vertical"
                  sx={{
                    mb: 3.5,
                    '& .MuiStepConnector-line': {
                      borderColor: '#E0E0E0',
                      minHeight: 18,
                    },
                    '& .MuiStepLabel-label': {
                      fontWeight: 500,
                      color: '#888',
                    },
                    '& .Mui-active .MuiStepLabel-label': {
                      color: '#1A1A1A',
                      fontWeight: 600,
                    },
                    '& .Mui-completed .MuiStepLabel-label': {
                      color: '#2E7D32',
                      fontWeight: 600,
                    },
                  }}
                >
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {!paiementEffectue ? (
                  <>
                    {/* ===== ÉTAPE 1 : INSCRIPTION ===== */}
                    {activeStep === 0 && (
                      <Fade in>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ color: '#666', mb: 2.5, lineHeight: 1.6 }}
                          >
                            Remplissez le formulaire pour vous inscrire à cette formation.
                          </Typography>

                          <TextField
                            fullWidth
                            label="Nom"
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            error={!!formErrors.nom}
                            helperText={formErrors.nom}
                            sx={{ mb: 2 }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Person sx={{ color: '#AAA', fontSize: 20 }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <TextField
                            fullWidth
                            label="Prénom"
                            name="prenom"
                            value={formData.prenom}
                            onChange={handleChange}
                            error={!!formErrors.prenom}
                            helperText={formErrors.prenom}
                            sx={{ mb: 2 }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Person sx={{ color: '#AAA', fontSize: 20 }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={!!formErrors.email}
                            helperText={formErrors.email}
                            sx={{ mb: 2 }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Email sx={{ color: '#AAA', fontSize: 20 }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <TextField
                            fullWidth
                            label="Téléphone"
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleChange}
                            error={!!formErrors.telephone}
                            helperText={formErrors.telephone}
                            sx={{ mb: 2 }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Phone sx={{ color: '#AAA', fontSize: 20 }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <TextField
                            fullWidth
                            label="Message / Questions (optionnel)"
                            name="notes"
                            multiline
                            rows={2}
                            value={formData.notes}
                            onChange={handleChange}
                            sx={{ mb: 3 }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                                  <Notes sx={{ color: '#AAA', fontSize: 20 }} />
                                </InputAdornment>
                              ),
                            }}
                          />

                          <Button
                            variant="contained"
                            fullWidth
                            onClick={handleInscription}
                            sx={{
                              backgroundColor: '#1A1A1A',
                              color: '#fff',
                              borderRadius: 50,
                              py: 1.6,
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              textTransform: 'none',
                              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                              '&:hover': {
                                backgroundColor: '#333',
                                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                              },
                            }}
                            startIcon={<Person />}
                          >
                            S'inscrire
                          </Button>
                        </Box>
                      </Fade>
                    )}

                    {/* ===== ÉTAPE 2 : PAIEMENT ===== */}
                    {activeStep === 1 && (
                      <Fade in>
                        <Box>
                          <Alert
                            severity="info"
                            sx={{
                              mb: 3,
                              borderRadius: 2.5,
                              backgroundColor: '#F5F9FF',
                              border: '1px solid #E3F2FD',
                            }}
                          >
                            Choisissez votre moyen de paiement pour finaliser l'inscription.
                          </Alert>

                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, mb: 1.5, color: '#333' }}
                          >
                            Moyen de paiement
                          </Typography>

                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 2.5 }}>
                            {Array.isArray(moyensPaiement) && moyensPaiement.length > 0 ? (
                              moyensPaiement.map((m) => {
                                const isSelected = moyenPaiementSelected === m.id.toString();
                                return (
                                  <Box
                                    key={m.id}
                                    onClick={() => setMoyenPaiementSelected(m.id.toString())}
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 2,
                                      p: 1.8,
                                      borderRadius: 2.5,
                                      border: isSelected
                                        ? '2px solid #2E7D32'
                                        : '1px solid #E8E8E8',
                                      backgroundColor: isSelected ? '#F1F8F1' : '#FAFAFA',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      '&:hover': {
                                        borderColor: isSelected ? '#2E7D32' : '#CCC',
                                        backgroundColor: isSelected ? '#F1F8F1' : '#F5F5F5',
                                      },
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 2,
                                        backgroundColor: isSelected ? '#E8F5E9' : '#EEE',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isSelected ? '#2E7D32' : '#666',
                                      }}
                                    >
                                      {PAIEMENT_ICONS[m.type] || <Payment />}
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontWeight: 600,
                                          color: '#1A1A1A',
                                        }}
                                      >
                                        {m.nom}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: '#888' }}
                                      >
                                        {m.type}
                                      </Typography>
                                    </Box>
                                    {isSelected && (
                                      <CheckCircle sx={{ color: '#2E7D32', fontSize: 22 }} />
                                    )}
                                  </Box>
                                );
                              })
                            ) : (
                              <Typography
                                variant="body2"
                                sx={{ color: '#999', textAlign: 'center', py: 3 }}
                              >
                                Aucun moyen de paiement disponible
                              </Typography>
                            )}
                          </Box>

                          {moyenPaiementSelected && (
                            <TextField
                              fullWidth
                              label="Numéro de téléphone ou identifiant"
                              placeholder="Ex: 07 01 23 45 67"
                              value={numeroPaiement}
                              onChange={(e) => setNumeroPaiement(e.target.value)}
                              sx={{ mb: 2.5 }}
                              helperText="Numéro utilisé pour le paiement (optionnel pour la simulation)"
                            />
                          )}

                          <Paper
                            elevation={0}
                            sx={{
                              p: 2.2,
                              backgroundColor: '#F8F8F8',
                              borderRadius: 2.5,
                              mb: 2.5,
                              border: '1px solid #EEE',
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <Typography variant="body2" sx={{ color: '#666' }}>
                                Montant à payer
                              </Typography>
                              <Typography
                                variant="h6"
                                sx={{ fontWeight: 700, color: '#1A1A1A' }}
                              >
                                {formation.prix_formate || `${formation.prix} CFA`}
                              </Typography>
                            </Box>
                          </Paper>

                          <Button
                            variant="contained"
                            fullWidth
                            onClick={handlePaiement}
                            disabled={!moyenPaiementSelected}
                            sx={{
                              backgroundColor: '#2E7D32',
                              color: '#fff',
                              borderRadius: 50,
                              py: 1.6,
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              textTransform: 'none',
                              boxShadow: '0 4px 14px rgba(46,125,50,0.25)',
                              '&:hover': {
                                backgroundColor: '#1B5E20',
                                boxShadow: '0 6px 18px rgba(46,125,50,0.3)',
                              },
                              '&.Mui-disabled': {
                                backgroundColor: '#E8E8E8',
                                color: '#999',
                                boxShadow: 'none',
                              },
                            }}
                            startIcon={<Payment />}
                          >
                            Payer maintenant
                          </Button>

                          <Button
                            variant="text"
                            fullWidth
                            sx={{
                              mt: 1.5,
                              color: '#777',
                              textTransform: 'none',
                              fontWeight: 500,
                            }}
                            onClick={() => setActiveStep(0)}
                          >
                            Retour
                          </Button>
                        </Box>
                      </Fade>
                    )}
                  </>
                ) : (
                  /* ===== ÉTAPE 3 : ACCÈS ===== */
                  <Fade in>
                    <Box>
                      <Alert
                        icon={<CheckCircle fontSize="inherit" />}
                        severity="success"
                        sx={{
                          borderRadius: 2.5,
                          mb: 3,
                          backgroundColor: '#E8F5E9',
                          border: '1px solid #C8E6C9',
                        }}
                      >
                        Félicitations ! Vous avez accès à la formation.
                      </Alert>

                      {codeAcces && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3.5,
                            backgroundColor: '#FAFAFA',
                            borderRadius: 3,
                            textAlign: 'center',
                            border: '1px solid #EEE',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#888',
                              display: 'block',
                              fontWeight: 500,
                              letterSpacing: 0.5,
                              textTransform: 'uppercase',
                            }}
                          >
                            Votre code d'accès
                          </Typography>

                          <Typography
                            variant="h3"
                            sx={{
                              fontWeight: 700,
                              color: '#1A1A1A',
                              fontFamily: 'monospace',
                              letterSpacing: 6,
                              py: 2.5,
                              fontSize: { xs: '1.8rem', sm: '2.2rem' },
                            }}
                          >
                            {codeAcces.code_acces || codeAcces.code}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{ color: '#666', mb: 2 }}
                          >
                            Valable jusqu'au{' '}
                            {new Date(codeAcces.date_expiration).toLocaleDateString(
                              'fr-FR',
                              {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </Typography>

                          <Divider sx={{ my: 2 }} />

                          <Typography
                            variant="caption"
                            sx={{
                              color: '#999',
                              display: 'block',
                              lineHeight: 1.5,
                            }}
                          >
                            ⚠️ Code à usage unique — Ne le partagez pas
                          </Typography>
                        </Paper>
                      )}

                      {formation.video_url || formation.replay_url ? (
                        <Button
                          variant="contained"
                          fullWidth
                          sx={{
                            mt: 3,
                            backgroundColor: '#E53935',
                            color: '#fff',
                            borderRadius: 50,
                            py: 1.7,
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            textTransform: 'none',
                            boxShadow: '0 4px 14px rgba(229,57,53,0.25)',
                            '&:hover': {
                              backgroundColor: '#C62828',
                              boxShadow: '0 6px 18px rgba(229,57,53,0.3)',
                            },
                          }}
                          startIcon={<PlayArrow />}
                          href={
                            formation.est_live
                              ? formation.video_url
                              : formation.replay_url
                          }
                          target="_blank"
                        >
                          {formation.est_live ? 'Rejoindre le live' : 'Voir le replay'}
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          fullWidth
                          disabled
                          sx={{
                            mt: 3,
                            borderRadius: 50,
                            py: 1.7,
                            textTransform: 'none',
                          }}
                        >
                          Vidéo bientôt disponible
                        </Button>
                      )}
                    </Box>
                  </Fade>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* ===== DIALOG DE CONFIRMATION ===== */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontFamily: '"Playfair Display", serif',
            }}
          >
            Confirmation du paiement
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: '#555', mb: 1.5 }}>
            Vous allez payer{' '}
            <strong>{formation.prix_formate || `${formation.prix} CFA`}</strong> pour :
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: '#1A1A1A', fontWeight: 600, mb: 1.5 }}
          >
            « {formation.titre} »
          </Typography>
          {Array.isArray(moyensPaiement) && moyenPaiementSelected && (
            <Typography variant="body2" sx={{ color: '#666' }}>
              Moyen de paiement :{' '}
              <strong>
                {moyensPaiement.find(
                  (m) => m.id === parseInt(moyenPaiementSelected)
                )?.nom || 'Non sélectionné'}
              </strong>
            </Typography>
          )}
          <Alert
            severity="warning"
            sx={{ mt: 2.5, borderRadius: 2.5 }}
          >
            Le code d'accès sera généré après paiement et sera valable 24h.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            sx={{ color: '#666', textTransform: 'none' }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirmerPaiement}
            variant="contained"
            disabled={processingPaiement}
            sx={{
              backgroundColor: '#2E7D32',
              color: '#fff',
              borderRadius: 50,
              px: 4,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#1B5E20' },
            }}
            startIcon={
              processingPaiement ? (
                <CircularProgress size={18} sx={{ color: '#fff' }} />
              ) : (
                <CheckCircle />
              )
            }
          >
            {processingPaiement ? 'Traitement...' : 'Confirmer le paiement'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== SNACKBAR ===== */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%', borderRadius: 2.5 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FormationDetail;