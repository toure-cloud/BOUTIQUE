// src/pages/FormationDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
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
  InputAdornment,
  Fade,
  Avatar,
  Stack,
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
  Star,
  Verified,
  School,
  Timer,
  MenuBook,      // ← Remplace BookOpen
  EmojiEvents,   // ← Remplace Award
  Group,         // ← Remplace Users
  VideoLibrary,
} from '@mui/icons-material';
import { formationService } from '../services/formationService';
import { paiementService } from '../services/paiementService';
import heroImage from '../assets/images/tibetia.jpeg';

const COACH_IMAGE = 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&h=400&fit=crop&q=80';

const PAIEMENT_ICONS = {
  WAVE: <QrCode sx={{ fontSize: 28 }} />,
  ORANGE_MONEY: <PhoneAndroid sx={{ fontSize: 28 }} />,
  MOOV_MONEY: <PhoneAndroid sx={{ fontSize: 28 }} />,
  MTN_MONEY: <PhoneAndroid sx={{ fontSize: 28 }} />,
  CARTE_BANCAIRE: <CreditCard sx={{ fontSize: 28 }} />,
};

const FormationDetail = () => {
  const { id } = useParams();

  const [formation, setFormation] = useState(null);
  const [moyensPaiement, setMoyensPaiement] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const [activeStep, setActiveStep] = useState(0);
  const [inscriptionId, setInscriptionId] = useState(null);
  const [codeAcces, setCodeAcces] = useState(null);
  const [paiementEffectue, setPaiementEffectue] = useState(false);

  const [moyenPaiementSelected, setMoyenPaiementSelected] = useState('');
  const [numeroPaiement, setNumeroPaiement] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [processingPaiement, setProcessingPaiement] = useState(false);

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
      setSnackbarMessage('✅ Inscription enregistrée ! Choisissez votre moyen de paiement.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Erreur d'inscription:", err);
      setSnackbarMessage("❌ Erreur lors de l'inscription");
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
          moyen: Array.isArray(moyensPaiement) &&
            moyensPaiement.find((m) => m.id === parseInt(moyenPaiementSelected))?.type,
          numero: numeroPaiement || 'Simulation',
          date: new Date().toISOString(),
        },
      };

      await formationService.creerTransaction(transactionData);

      setTimeout(() => {
        setCodeAcces({ 
          code_acces: 'ACCES-' + Math.random().toString(36).substring(2, 10).toUpperCase(), 
          date_expiration: new Date(Date.now() + 86400000).toISOString() 
        });
        setPaiementEffectue(true);
        setActiveStep(2);
        setProcessingPaiement(false);
        setSnackbarMessage("🎉 Paiement effectué ! Code d'accès généré.");
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }, 2000);
    } catch (err) {
      console.error('Erreur de paiement:', err);
      setProcessingPaiement(false);
      setSnackbarMessage('❌ Erreur lors du paiement');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const getStatutChip = (formation) => {
    if (formation.est_live) {
      return <Chip icon={<LiveTv sx={{ fontSize: 16, color: '#fff' }} />} label="🔴 EN DIRECT" sx={{ backgroundColor: '#E53935', color: '#FFFFFF', fontWeight: 700, height: 32 }} />;
    }
    if (formation.est_replay) {
      return <Chip icon={<Replay sx={{ fontSize: 16 }} />} label="📹 REPLAY" sx={{ backgroundColor: '#1A1A1A', color: '#FFFFFF', fontWeight: 600, height: 32 }} />;
    }
    return <Chip icon={<EventNote sx={{ fontSize: 16 }} />} label="📅 PROGRAMMÉ" sx={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', fontWeight: 600, height: 32, backdropFilter: 'blur(8px)' }} />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress sx={{ color: '#2E7D32' }} thickness={4} size={60} />
      </Box>
    );
  }

  if (error || !formation) {
    return (
      <Container maxWidth={false} sx={{ py: 10, px: { xs: 2, md: 4 } }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>{error || 'Formation non trouvée'}</Alert>
        <Button component={Link} to="/" startIcon={<ArrowBack />} variant="outlined" sx={{ mt: 3 }}>
          Retour à l'accueil
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#F5F7F5', minHeight: '100vh', width: '100%' }}>
      
      {/* ===== HEADER ===== */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 250, md: 320 },
          width: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
          backgroundColor: '#1A1A1A',
        }}
      >
        <Box
          component="img"
          src={formation.image ? `${import.meta.env.VITE_MEDIA_URL}${formation.image}` : heroImage}
          alt={formation.titre}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.3,
          }}
        />

        {/* Coach Avatar */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 15, md: 25 },
            right: { xs: 15, md: 50 },
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Avatar
            src={COACH_IMAGE}
            sx={{
              width: { xs: 70, md: 100 },
              height: { xs: 70, md: 100 },
              border: `3px solid #66BB6A`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          />
          <Chip
            icon={<Star sx={{ fontSize: { xs: 12, md: 16 } }} />}
            label="Expert"
            size="small"
            sx={{
              backgroundColor: '#E8F5E9',
              color: '#2E7D32',
              fontWeight: 700,
              fontSize: { xs: '0.6rem', md: '0.7rem' },
              border: '1px solid #66BB6A',
            }}
          />
        </Box>

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(20,20,20,0.95) 0%, rgba(20,20,20,0.5) 50%, rgba(20,20,20,0.2) 100%)',
          }}
        />

        <Container maxWidth={false} sx={{ position: 'relative', zIndex: 1, pb: { xs: 3, md: 4 }, px: { xs: 3, md: 6 } }}>
          <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.6)', letterSpacing: 3, fontWeight: 600, fontSize: '0.7rem' }}>
            🎓 FORMATION
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: '#FFFFFF',
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.8rem' },
              lineHeight: 1.15,
              mb: 2,
              maxWidth: 700,
            }}
          >
            {formation.titre}
          </Typography>
          <Box>{getStatutChip(formation)}</Box>
        </Container>
      </Box>

      {/* ===== CONTENU ===== */}
      <Container maxWidth={false} sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 4 } }}>
        
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBack />}
          sx={{ mb: 3, color: '#666', fontWeight: 500, '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
        >
          Retour
        </Button>

        <Grid container spacing={3}>
          
          {/* ===== GAUCHE ===== */}
          <Grid item xs={12} md={6}>
            
            {/* Description */}
            <Box
              sx={{
                p: { xs: 2.5, md: 3.5 },
                borderRadius: 3,
                border: '2px solid #66BB6A',
                backgroundColor: '#FFFFFF',
                mb: 3,
                boxShadow: '0 2px 12px rgba(46,125,50,0.06)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1A1A', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MenuBook sx={{ color: '#2E7D32' }} /> Description
              </Typography>
              <Typography variant="body1" sx={{ color: '#555', lineHeight: 1.8 }}>
                {formation.description_detail || formation.description || 'Description de test'}
              </Typography>
            </Box>

            {/* Infos pratiques */}
            <Box
              sx={{
                p: { xs: 2.5, md: 3.5 },
                borderRadius: 3,
                border: '2px solid #66BB6A',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 12px rgba(46,125,50,0.06)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1A1A', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timer sx={{ color: '#2E7D32' }} /> Informations pratiques
              </Typography>

              <Grid container spacing={1.5}>
                {[
                  { icon: <AttachMoney />, label: 'Prix', value: formation.prix_formate || `${formation.prix} CFA` },
                  { icon: <AccessTime />, label: 'Durée', value: formation.duree || '3h' },
                  { icon: <CalendarToday />, label: 'Date', value: '4 sept 2026' },
                  { icon: <AccessTime />, label: 'Horaire', value: '17:22' },
                ].map((item, idx) => (
                  <Grid item xs={6} sm={3} key={idx}>
                    <Box
                      sx={{
                        textAlign: 'center',
                        p: 1.5,
                        borderRadius: 2.5,
                        backgroundColor: '#E8F5E9',
                        border: '1px solid #66BB6A',
                      }}
                    >
                      <Box sx={{ color: '#2E7D32', fontSize: 24 }}>{item.icon}</Box>
                      <Typography variant="caption" sx={{ display: 'block', color: '#888', fontSize: '0.6rem', fontWeight: 500 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: { xs: '0.65rem', md: '0.8rem' } }}>
                        {item.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* ===== DROITE ===== */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: { xs: 2.5, md: 3.5 },
                borderRadius: 3,
                border: '2px solid #66BB6A',
                backgroundColor: '#FFFFFF',
                position: 'sticky',
                top: 20,
                boxShadow: '0 2px 12px rgba(46,125,50,0.06)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1A1A', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                {paiementEffectue ? <CheckCircle sx={{ color: '#2E7D32' }} /> : <School sx={{ color: '#2E7D32' }} />}
                {paiementEffectue ? 'Accès autorisé' : 'Inscription'}
              </Typography>

              {!paiementEffectue ? (
                <>
                  {activeStep === 0 && (
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 2, fontSize: '0.9rem' }}>
                        Remplissez le formulaire pour vous inscrire.
                      </Typography>

                      <TextField
                        fullWidth
                        size="small"
                        label="Nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        error={!!formErrors.nom}
                        helperText={formErrors.nom}
                        sx={{ mb: 1.5 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#2E7D32', fontSize: 18 }} /></InputAdornment> }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Prénom"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        error={!!formErrors.prenom}
                        helperText={formErrors.prenom}
                        sx={{ mb: 1.5 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#2E7D32', fontSize: 18 }} /></InputAdornment> }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!formErrors.email}
                        helperText={formErrors.email}
                        sx={{ mb: 1.5 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#2E7D32', fontSize: 18 }} /></InputAdornment> }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Téléphone"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        error={!!formErrors.telephone}
                        helperText={formErrors.telephone}
                        sx={{ mb: 1.5 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{ color: '#2E7D32', fontSize: 18 }} /></InputAdornment> }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Message (optionnel)"
                        name="notes"
                        multiline
                        rows={2}
                        value={formData.notes}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                      />

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleInscription}
                        sx={{
                          backgroundColor: '#2E7D32',
                          borderRadius: 50,
                          py: 1.5,
                          fontWeight: 700,
                          textTransform: 'none',
                          '&:hover': { backgroundColor: '#1B5E20' },
                        }}
                        startIcon={<Person />}
                      >
                        S'inscrire
                      </Button>
                    </Box>
                  )}

                  {activeStep === 1 && (
                    <Box>
                      <Alert severity="info" sx={{ mb: 2, borderRadius: 2, py: 0, border: '1px solid #66BB6A' }}>
                        Choisissez votre moyen de paiement.
                      </Alert>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                        {Array.isArray(moyensPaiement) && moyensPaiement.slice(0, 4).map((m) => {
                          const isSelected = moyenPaiementSelected === m.id.toString();
                          return (
                            <Box
                              key={m.id}
                              onClick={() => setMoyenPaiementSelected(m.id.toString())}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                p: 1.5,
                                borderRadius: 2.5,
                                border: isSelected ? '3px solid #2E7D32' : '2px solid #E8F5E9',
                                backgroundColor: isSelected ? '#E8F5E9' : '#FAFAFA',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': { borderColor: '#66BB6A' },
                              }}
                            >
                              <Box sx={{ width: 38, height: 38, borderRadius: 2, backgroundColor: isSelected ? '#2E7D32' : '#EEEEEE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? '#FFF' : '#888' }}>
                                {PAIEMENT_ICONS[m.type] || <Payment />}
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{m.nom}</Typography>
                                <Typography variant="caption" sx={{ color: '#888' }}>{m.type}</Typography>
                              </Box>
                              {isSelected && <CheckCircle sx={{ color: '#2E7D32', fontSize: 20 }} />}
                            </Box>
                          );
                        })}
                      </Box>

                      <Paper sx={{ p: 1.5, backgroundColor: '#E8F5E9', borderRadius: 2.5, mb: 2, border: '1px solid #66BB6A' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>💰 Montant</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#2E7D32', fontSize: '1.1rem' }}>
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
                          borderRadius: 50,
                          py: 1.5,
                          fontWeight: 700,
                          textTransform: 'none',
                          '&:hover': { backgroundColor: '#1B5E20' },
                          '&.Mui-disabled': { backgroundColor: '#E0E0E0', color: '#999' },
                        }}
                        startIcon={<Payment />}
                      >
                        Payer maintenant
                      </Button>
                    </Box>
                  )}
                </>
              ) : (
                <Box>
                  <Alert severity="success" sx={{ mb: 2, borderRadius: 2, backgroundColor: '#E8F5E9', border: '1px solid #66BB6A' }}>
                    🎉 Félicitations ! Vous avez accès.
                  </Alert>
                  
                  <Paper sx={{ p: 2.5, textAlign: 'center', borderRadius: 2.5, border: '2px solid #66BB6A', backgroundColor: '#F5FFF5' }}>
                    <Typography variant="caption" sx={{ color: '#888' }}>🔑 Code d'accès</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#2E7D32', fontFamily: 'monospace', letterSpacing: 4, py: 1.5 }}>
                      {codeAcces?.code_acces || 'ACCES-XXXX'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#888' }}>Valable 24h</Typography>
                  </Paper>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2.5, backgroundColor: '#E53935', borderRadius: 50, py: 1.5, fontWeight: 700, textTransform: 'none', '&:hover': { backgroundColor: '#C62828' } }}
                    startIcon={<PlayArrow />}
                    href={formation.video_url || formation.replay_url || '#'}
                    target="_blank"
                  >
                    {formation.est_live ? '▶ Rejoindre le live' : '▶ Voir le replay'}
                  </Button>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ===== DIALOG ===== */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>💳 Confirmation</DialogTitle>
        <DialogContent>
          <Typography>Vous allez payer <strong style={{ color: '#2E7D32' }}>{formation.prix_formate || `${formation.prix} CFA`}</strong> pour :</Typography>
          <Paper sx={{ p: 2, mt: 1.5, backgroundColor: '#E8F5E9', borderRadius: 2, border: '1px solid #66BB6A' }}>
            <Typography fontWeight={700}>« {formation.titre} »</Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleConfirmerPaiement} variant="contained" disabled={processingPaiement} sx={{ backgroundColor: '#2E7D32', '&:hover': { backgroundColor: '#1B5E20' } }}>
            {processingPaiement ? 'Traitement...' : 'Confirmer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== SNACKBAR ===== */}
      <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity={snackbarSeverity} sx={{ borderRadius: 2.5 }}>{snackbarMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

export default FormationDetail;