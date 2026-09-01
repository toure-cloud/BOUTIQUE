// src/pages/RelookingHommeDetail.jsx
import React, { useState, useMemo } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Fade,
  Stack,
  Avatar,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Person,
  Star,
  AccessTime,
  EmojiEvents,
  Check,
  Close,
  Schedule,
  WorkspacePremium,
  LocalOffer,
  ArrowForward,
} from '@mui/icons-material';
import heroImage from '../assets/images/tibetia.jpeg';

// ============================================================
// DONNÉES
// ============================================================
const RUBRIQUES = {
  1: {
    id: 1,
    nom: 'Coaching Relooking Homme',
    categorie: 'Coaching',
    description: 'Un accompagnement personnalisé pour révéler votre style et votre charisme.',
    description_detail: `
Le coaching relooking homme est une prestation complète qui vous permet de transformer votre image et de gagner en confiance.

## Ce que comprend cette prestation

• Analyse de votre morphologie : Identification de vos atouts et des points à mettre en valeur
• Définition de votre identité vestimentaire : Création d'un style qui vous ressemble
• Choix des vêtements adaptés : Sélection de pièces qui vous mettent en valeur
• Maîtrise des associations de couleurs : Apprenez à harmoniser vos tenues
• Développement de la confiance en vous : Techniques pour adopter une posture assurée

## Programme détaillé

Séance 1 - Bilan d'image (2h)
- Analyse de votre style actuel
- Définition de vos objectifs
- Test de personnalité stylistique

Séance 2 - Morphologie et couleurs (2h)
- Étude de votre morphologie
- Détermination de votre palette de couleurs
- Exercices pratiques

Séance 3 - Shopping accompagné (2h)
- Sélection de boutiques adaptées
- Choix de pièces clés
- Conseils en direct

Séance 4 - Restyling de garde-robe (2h)
- Tri et organisation
- Création de combinaisons
- Liste des pièces à compléter

Séance 5 - Finalisation et suivi (2h)
- Bilan de la transformation
- Conseils pour l'entretien
- Plan de suivi sur 3 mois
    `,
    prix: '150 000 CFA',
    duree: '5 séances',
    note: 4.9,
    nb_avis: 47,
    youWillLearn: [
      'Analyser votre morphologie et votre style actuel',
      'Définir votre identité vestimentaire',
      'Choisir les vêtements qui vous mettent en valeur',
      'Maîtriser l\'art des associations de couleurs',
      'Développer votre confiance en vous',
    ],
    avantages: [
      'Accompagnement personnalisé',
      'Suivi sur 3 mois',
      'Guide de style exclusif',
      'Photos avant/après',
    ],
  },
  2: {
    id: 2,
    nom: "Bilan d'Image et Accompagnement",
    categorie: 'Bilan',
    description: 'Une analyse complète de votre image pour une transformation durable.',
    description_detail: `
Le bilan d'image est une étape fondamentale pour comprendre votre potentiel stylistique.

## Ce que comprend cette prestation

• Analyse de votre morphologie : Identification de vos atouts
• Étude de vos couleurs (colormetry) : Découverte de votre palette
• Définition de votre style personnel : Création d'une signature unique
• Évaluation de votre garde-robe : Audit complet de vos vêtements
• Conseil en coiffure et accessoires : Conseils pour compléter votre style

## Programme détaillé

Séance 1 - Diagnostic complet (2h)
- Analyse morphologique
- Test colorimétrique
- Définition des objectifs

Séance 2 - Style et garde-robe (2h)
- Définition de votre style
- Audit de votre dressing
- Recommandations

Séance 3 - Finalisation (2h)
- Livret de style personnalisé
- Séance photo
- Plan d'action
    `,
    prix: '120 000 CFA',
    duree: '3 séances',
    note: 4.8,
    nb_avis: 32,
    youWillLearn: [
      'Analyse de votre morphologie',
      'Étude de vos couleurs (colormetry)',
      'Définition de votre style personnel',
      'Évaluation de votre garde-robe actuelle',
      'Conseil en coiffure et accessoires',
    ],
    avantages: [
      'Livret de style personnalisé',
      'Séance photo professionnelle',
      'Guide d\'entretien',
      'Suivi personnalisé',
    ],
  },
  3: {
    id: 3,
    nom: 'Relooking Sublime "Style"',
    categorie: 'Sublime',
    description: 'Une transformation complète pour un style élégant et affirmé.',
    description_detail: `
Le relooking sublime est une prestation premium pour une transformation radicale.

## Ce que comprend cette prestation

• Transformation complète de votre image
• Conseils en style et élégance
• Shopping guidé avec un expert
• Restyling de votre garde-robe
• Conseils en maintien et posture

## Programme détaillé

Séance 1 - Bilan complet (2h30)
- Analyse approfondie
- Définition des objectifs
- Plan d'action

Séance 2 - Shopping exclusif (2h30)
- Boutiques sélectionnées
- Choix de pièces signatures
- Conseils en direct

Séance 3 - Restyling (2h30)
- Transformation de votre dressing
- Création de looks
- Photos professionnelles

Séance 4 - Finalisation (2h30)
- Bilan de la transformation
- Guide de style exclusif
- Suivi 12 mois
    `,
    prix: '200 000 CFA',
    duree: '4 séances',
    note: 5.0,
    nb_avis: 28,
    youWillLearn: [
      'Transformation complète de votre image',
      'Conseils en style et élégance',
      'Shopping guidé avec un expert',
      'Restyling de votre garde-robe',
      'Conseils en maintien et posture',
    ],
    avantages: [
      'Guide de style exclusif',
      'Photos avant/après',
      'Suivi 12 mois',
      'Dressing complet revisité',
    ],
  },
  4: {
    id: 4,
    nom: 'Relooking Homme Vintage',
    categorie: 'Vintage',
    description: 'Un style vintage revisité avec élégance et modernité.',
    description_detail: `
Le relooking vintage est une expérience unique pour adopter un style intemporel.

## Ce que comprend cette prestation

• Découverte des codes du style vintage
• Association de pièces anciennes et modernes
• Conseils sur les accessoires d'époque
• Shopping dans des boutiques sélectionnées
• Création d'une garde-robe vintage moderne

## Programme détaillé

Séance 1 - Initiation au vintage (2h)
- Histoire du style vintage
- Codes vestimentaires
- Inspiration et références

Séance 2 - Shopping vintage (2h)
- Boutiques sélectionnées
- Pièces uniques
- Associations

Séance 3 - Création de look (2h)
- Associations modernes
- Accessoires
- Lookbook personnalisé
    `,
    prix: '130 000 CFA',
    duree: '3 séances',
    note: 4.7,
    nb_avis: 19,
    youWillLearn: [
      'Découverte des codes du style vintage',
      'Association de pièces anciennes et modernes',
      'Conseils sur les accessoires d\'époque',
      'Shopping dans des boutiques sélectionnées',
      'Création d\'une garde-robe vintage moderne',
    ],
    avantages: [
      'Lookbook personnalisé',
      'Guide des marques vintage',
      'Conseils d\'entretien',
      'Pièces uniques',
    ],
  },
};

// ============================================================
// RENDU DESCRIPTION
// ============================================================
const RichDescription = ({ content }) => {
  const lines = useMemo(() => content?.split('\n') || [], [content]);

  return (
    <Box>
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('## ')) {
          return (
            <Typography
              key={index}
              variant="h6"
              sx={{
                mt: index === 0 ? 0 : 3,
                mb: 1.5,
                fontWeight: 700,
                color: '#1a1a1a',
                fontFamily: '"Playfair Display", serif',
              }}
            >
              {trimmed.replace('## ', '')}
            </Typography>
          );
        }

        if (trimmed.startsWith('• ')) {
          return (
            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 0.5 }}>
              <Box
                sx={{
                  mt: 0.8,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#2C2C2C',
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.7 }}>
                {trimmed.replace('• ', '')}
              </Typography>
            </Box>
          );
        }

        if (trimmed.startsWith('- ')) {
          return (
            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, pl: 1.5, py: 0.3 }}>
              <Check sx={{ fontSize: 16, color: '#4CAF50', mt: 0.3, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
                {trimmed.replace('- ', '')}
              </Typography>
            </Box>
          );
        }

        if (/^Séance\s+\d+/i.test(trimmed)) {
          return (
            <Box key={index} sx={{ mt: 2.5, mb: 0.75, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Schedule sx={{ fontSize: 18, color: '#888' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                {trimmed}
              </Typography>
            </Box>
          );
        }

        return (
          <Typography key={index} variant="body2" sx={{ color: '#555', lineHeight: 1.8, mb: 1.25 }}>
            {trimmed}
          </Typography>
        );
      })}
    </Box>
  );
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
const RelookingHommeDetail = () => {
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const rubrique = RUBRIQUES[id];

  const [registerOpen, setRegisterOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    date: '',
    message: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [loading, setLoading] = useState(false);

  if (!rubrique) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <Alert severity="error" sx={{ borderRadius: 3, mb: 3, maxWidth: 480, mx: 'auto' }}>
          Rubrique non trouvée
        </Alert>
        <Button component={Link} to="/relooking/homme" startIcon={<ArrowBack />} variant="outlined" sx={{ borderRadius: 50 }}>
          Retour aux rubriques
        </Button>
      </Container>
    );
  }

  const handleOpenRegister = () => setRegisterOpen(true);

  const handleCloseRegister = () => {
    setRegisterOpen(false);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ nom: '', prenom: '', email: '', telephone: '', date: '', message: '' });
    }, 300);
  };

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      console.log('Inscription:', { ...formData, rubrique: rubrique.nom });
      setFormSubmitted(true);
      setLoading(false);
      setSnackbarMessage('Inscription réussie ! Vous recevrez un email de confirmation.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      setTimeout(() => handleCloseRegister(), 2200);
    }, 1400);
  };

  return (
    <Box sx={{ bgcolor: '#FAFAFA', minHeight: '100vh' }}>
      {/* HERO */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 220, md: 300 },
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
          bgcolor: '#1a1a1a',
        }}
      >
        <Box
          component="img"
          src={heroImage}
          alt={rubrique.nom}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 20%',
            opacity: 0.3,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(26,26,26,0.3) 0%, rgba(26,26,26,0.85) 100%)',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pb: { xs: 3, md: 4 } }}>
          <Chip
            label="RELOOKING HOMME"
            size="small"
            sx={{
              mb: 1.5,
              bgcolor: 'rgba(255,255,255,0.12)',
              color: '#fff',
              fontWeight: 600,
              letterSpacing: 1.5,
              fontSize: '0.7rem',
              height: 26,
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: '#fff',
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '1.75rem', md: '2.75rem' },
              mb: 2,
            }}
          >
            {rubrique.nom}
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<Star sx={{ color: '#FFB400 !important', fontSize: 16 }} />}
              label={`${rubrique.note} · ${rubrique.nb_avis} avis`}
              sx={{ bgcolor: 'rgba(255,255,255,0.95)', fontWeight: 600 }}
            />
            <Chip label={rubrique.categorie} sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600 }} />
          </Stack>
        </Container>
      </Box>

      {/* CONTENU */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Button
          component={Link}
          to="/relooking/homme"
          startIcon={<ArrowBack />}
          sx={{ mb: 4, color: '#666' }}
        >
          Retour aux rubriques
        </Button>

        <Grid container spacing={4} sx={{ alignItems: "flex-start" }}>
          {/* COLONNE GAUCHE */}
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              {/* Card Description */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: 'rgba(0,0,0,0.08)',
                  bgcolor: '#fff',
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 2.5,
                      fontFamily: '"Playfair Display", serif',
                      color: '#1a1a1a',
                    }}
                  >
                    Description détaillée
                  </Typography>
                  <RichDescription content={rubrique.description_detail} />
                </CardContent>
              </Card>

              {/* Card Apprentissages */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: 'rgba(0,0,0,0.08)',
                  bgcolor: '#fff',
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 2.5,
                      fontFamily: '"Playfair Display", serif',
                      color: '#1a1a1a',
                    }}
                  >
                    Ce que vous allez apprendre
                  </Typography>
                  <Stack spacing={1.75}>
                    {rubrique.youWillLearn.map((point, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: 'rgba(76, 175, 80, 0.12)',
                            color: '#2e7d32',
                          }}
                        >
                          <CheckCircle sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="body2" sx={{ color: '#444', pt: 0.4 }}>
                          {point}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* COLONNE DROITE - Sticky */}
          <Grid item xs={12} md={5}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: 'rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
                }}
              >
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2C2C2C 100%)',
                    px: 3,
                    py: 2.5,
                    color: '#fff',
                  }}
                >
                  <Typography variant="overline" sx={{ opacity: 0.7, letterSpacing: 1.5, fontSize: '0.7rem' }}>
                    Résumé de la prestation
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      fontFamily: '"Playfair Display", serif',
                      mt: 0.5,
                      fontSize: '1.25rem',
                    }}
                  >
                    {rubrique.nom}
                  </Typography>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2.5} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.06)', color: '#1a1a1a', width: 42, height: 42 }}>
                        <LocalOffer sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          Prix
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="#1a1a1a">
                          {rubrique.prix}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.06)', color: '#1a1a1a', width: 42, height: 42 }}>
                        <AccessTime sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          Durée
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="#1a1a1a">
                          {rubrique.duree}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.06)', color: '#1a1a1a', width: 42, height: 42 }}>
                        <WorkspacePremium sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          Note
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="#1a1a1a">
                          {rubrique.note}/5 ({rubrique.nb_avis} avis)
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>

                  <Divider sx={{ mb: 2.5 }} />

                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: '#1a1a1a' }}>
                    Avantages inclus
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 3.5 }}>
                    {rubrique.avantages.map((avantage, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Check sx={{ fontSize: 17, color: '#4CAF50' }} />
                        <Typography variant="body2" color="#555">
                          {avantage}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleOpenRegister}
                    endIcon={<ArrowForward />}
                    sx={{
                      bgcolor: '#1a1a1a',
                      color: '#fff',
                      borderRadius: '50px',
                      py: 1.6,
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                      '&:hover': {
                        bgcolor: '#333',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    S'inscrire à cette prestation
                  </Button>

                  <Typography
                    variant="caption"
                    sx={{ display: 'block', textAlign: 'center', mt: 1.5, color: '#999' }}
                  >
                    Places disponibles · Inscription rapide
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ===================== MODAL PROFESSIONNEL ===================== */}
      <Dialog
        open={registerOpen}
        onClose={handleCloseRegister}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : '20px',          // ← bord arrondi professionnel
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          },
        }}
      >
        {/* Header du modal */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2C2C2C 100%)',
            color: '#fff',
            px: 3,
            py: 2.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.7, letterSpacing: 1.5, fontSize: '0.7rem' }}>
              Inscription
            </Typography>
            <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, mt: 0.3 }}>
              Réserver cette prestation
            </Typography>
          </Box>
          <IconButton onClick={handleCloseRegister} sx={{ color: '#fff' }}>
            <Close />
          </IconButton>
        </Box>

        <DialogContent sx={{ px: 3, py: 3 }}>
          <Alert
            severity="info"
            icon={false}
            sx={{
              mb: 3,
              borderRadius: '12px',
              bgcolor: 'rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.06)',
              color: '#333',
            }}
          >
            Vous vous inscrivez à : <strong>{rubrique.nom}</strong>
          </Alert>

          {formSubmitted ? (
            <Fade in>
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <CheckCircle sx={{ fontSize: 72, color: '#4CAF50', mb: 2 }} />
                <Typography variant="h6" fontWeight={700} color="#1a1a1a" gutterBottom>
                  Inscription réussie !
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vous recevrez un email de confirmation avec tous les détails.
                </Typography>
              </Box>
            </Fade>
          ) : (
            <form onSubmit={handleFormSubmit}>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleFormChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prénom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleFormChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Téléphone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleFormChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Date souhaitée"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
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
                    placeholder="Décrivez vos attentes..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <DialogActions sx={{ px: 0, pt: 3.5, pb: 0 }}>
                <Button
                  onClick={handleCloseRegister}
                  sx={{
                    color: '#666',
                    borderRadius: '50px',
                    px: 3,
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: '#1a1a1a',
                    color: '#fff',
                    borderRadius: '50px',
                    px: 4,
                    py: 1.2,
                    fontWeight: 600,
                    textTransform: 'none',
                    minWidth: 150,
                    '&:hover': { bgcolor: '#333' },
                    '&.Mui-disabled': { bgcolor: '#555', color: '#fff' },
                  }}
                  startIcon={
                    loading ? (
                      <CircularProgress size={18} sx={{ color: '#fff' }} />
                    ) : (
                      <CheckCircle sx={{ fontSize: 20 }} />
                    )
                  }
                >
                  {loading ? 'Envoi...' : "S'inscrire"}
                </Button>
              </DialogActions>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%', borderRadius: '12px' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RelookingHommeDetail;