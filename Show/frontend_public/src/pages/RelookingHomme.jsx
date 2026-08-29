// src/pages/RelookingHomme.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Snackbar,
  Grid,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import {
  ArrowForward,
  ArrowBack,
  Close,
  CheckCircle,
  Person,
  Star,
  AccessTime,
  EmojiEvents,
  Check,
  AttachMoney,
  CalendarToday,
} from '@mui/icons-material';
import heroImage from '../assets/images/tibetia.jpeg';

// ============================================================
// DONNÉES DES RUBRIQUES HOMME
// ============================================================
const RUBRIQUES = [
  {
    id: 1,
    nom: 'Coaching Relooking Homme',
    categorie: 'Coaching',
    description: 'Un accompagnement personnalisé pour révéler votre style et votre charisme.',
    description_detail: `
Le coaching relooking homme est une prestation complète qui vous permet de transformer votre image et de gagner en confiance.

## Ce que comprend cette prestation :

• Analyse de votre morphologie : Identification de vos atouts et des points à mettre en valeur
• Définition de votre identité vestimentaire : Création d'un style qui vous ressemble
• Choix des vêtements adaptés : Sélection de pièces qui vous mettent en valeur
• Maîtrise des associations de couleurs : Apprenez à harmoniser vos tenues
• Développement de la confiance en vous : Techniques pour adopter une posture assurée

## Programme détaillé :

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
    icon: <Person sx={{ fontSize: 40, color: '#A0A0A0' }} />,
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
  {
    id: 2,
    nom: "Bilan d'Image et Accompagnement",
    categorie: 'Bilan',
    description: 'Une analyse complète de votre image pour une transformation durable.',
    description_detail: `
Le bilan d'image est une étape fondamentale pour comprendre votre potentiel stylistique.

## Ce que comprend cette prestation :

• Analyse de votre morphologie : Identification de vos atouts
• Étude de vos couleurs (colormetry) : Découverte de votre palette
• Définition de votre style personnel : Création d'une signature unique
• Évaluation de votre garde-robe : Audit complet de vos vêtements
• Conseil en coiffure et accessoires : Conseils pour compléter votre style

## Programme détaillé :

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
    icon: <Star sx={{ fontSize: 40, color: '#A0A0A0' }} />,
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
  {
    id: 3,
    nom: 'Relooking Sublime "Style"',
    categorie: 'Sublime',
    description: 'Une transformation complète pour un style élégant et affirmé.',
    description_detail: `
Le relooking sublime est une prestation premium pour une transformation radicale.

## Ce que comprend cette prestation :

• Transformation complète de votre image
• Conseils en style et élégance
• Shopping guidé avec un expert
• Restyling de votre garde-robe
• Conseils en maintien et posture

## Programme détaillé :

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
    icon: <EmojiEvents sx={{ fontSize: 40, color: '#A0A0A0' }} />,
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
  {
    id: 4,
    nom: 'Relooking Homme Vintage',
    categorie: 'Vintage',
    description: 'Un style vintage revisité avec élégance et modernité.',
    description_detail: `
Le relooking vintage est une expérience unique pour adopter un style intemporel.

## Ce que comprend cette prestation :

• Découverte des codes du style vintage
• Association de pièces anciennes et modernes
• Conseils sur les accessoires d'époque
• Shopping dans des boutiques sélectionnées
• Création d'une garde-robe vintage moderne

## Programme détaillé :

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
    icon: <AccessTime sx={{ fontSize: 40, color: '#A0A0A0' }} />,
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
];

const RelookingHomme = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  // ===== ÉTATS POUR LE DIALOG D'INSCRIPTION =====
  const [selectedRubrique, setSelectedRubrique] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
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

  // ===== GESTION DU SCROLL =====
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth',
      });
    }
  };

  // ===== GESTION DU DIALOG D'INSCRIPTION =====
  const handleOpenRegister = (rubrique) => {
    setSelectedRubrique(rubrique);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRubrique(null);
    setFormSubmitted(false);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      date: '',
      message: '',
    });
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulation d'envoi
    setTimeout(() => {
      console.log('Inscription:', { ...formData, rubrique: selectedRubrique?.nom });
      setFormSubmitted(true);
      setLoading(false);
      setSnackbarMessage('✅ Inscription réussie ! Vous recevrez un email de confirmation.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      setTimeout(() => {
        setDialogOpen(false);
        setFormSubmitted(false);
        setFormData({
          nom: '',
          prenom: '',
          email: '',
          telephone: '',
          date: '',
          message: '',
        });
      }, 2000);
    }, 1500);
  };

  // ===== NAVIGATION VERS LA PAGE DE DÉTAILS =====
  const handleViewDetails = (rubriqueId) => {
    navigate(`/relooking/homme/${rubriqueId}`);
  };

  return (
    <Box>
      {/* ===== HERO SECTION ===== */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '180px', md: '250px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: '#2C2C2C',
        }}
      >
        <Box
          component="img"
          src={heroImage}
          alt="Relooking Homme"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
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
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(44,44,44,0.8) 0%, rgba(44,44,44,0.4) 100%)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography variant="overline" sx={{ color: '#A0A0A0', letterSpacing: 3, fontWeight: 600, fontSize: '0.7rem', display: 'block', mb: 1 }}>MADAME TIBETIA</Typography>
          <Typography variant="h2" sx={{ fontWeight: 700, color: '#FFFFFF', fontFamily: '"Playfair Display", serif', fontSize: { xs: '1.8rem', md: '3rem' } }}>Relooking Homme</Typography>
          <Typography variant="body1" sx={{ color: '#E8E8E8', mt: 1, fontSize: { xs: '0.9rem', md: '1.1rem' } }}>Révélez votre style avec élégance et confiance</Typography>
        </Container>
      </Box>

      {/* ===== INTRODUCTION ===== */}
      <Box sx={{ py: 3, backgroundColor: '#FFFFFF', borderBottom: '1px solid #F0F0F0' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C2C2C', fontFamily: '"Playfair Display", serif', mb: 1, textAlign: 'center', fontSize: { xs: '1.5rem', md: '2rem' } }}>Nos Rubriques pour Homme</Typography>
          <Typography variant="body1" sx={{ color: '#666666', textAlign: 'center', maxWidth: '700px', mx: 'auto', lineHeight: 1.6, fontSize: { xs: '0.85rem', md: '1rem' } }}>Découvrez nos rubriques de relooking conçues pour révéler votre style et votre charisme.</Typography>
        </Container>
      </Box>

      {/* ===== CONTENEUR FLEX : TOUTES LES RUBRIQUES SUR UNE SEULE LIGNE AVEC SCROLL ===== */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 3, md: 5 },
          px: { xs: 2, md: 4 },
        }}
      >
        {/* ===== BOUTON GAUCHE ===== */}
        <IconButton
          onClick={scrollLeft}
          sx={{
            position: 'absolute',
            left: { xs: 0, md: 10 },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            backgroundColor: 'rgba(255,255,255,0.9)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: '#FFFFFF',
            },
            display: { xs: 'none', sm: 'flex' },
          }}
        >
          <ArrowBack />
        </IconButton>

        {/* ===== CONTENEUR SCROLLABLE ===== */}
        <Box
          ref={scrollContainerRef}
          sx={{
            overflowX: 'auto',
            overflowY: 'hidden',
            whiteSpace: 'nowrap',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': {
              height: '6px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#F5F5F5',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#D0D0D0',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#A0A0A0',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 3,
              width: 'fit-content',
              mx: 'auto',
              px: { xs: 1, md: 4 },
            }}
          >
            {RUBRIQUES.map((item) => (
              <Card
                key={item.id}
                sx={{
                  minWidth: { xs: '250px', sm: '280px', md: '300px' },
                  maxWidth: { xs: '250px', sm: '280px', md: '300px' },
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.08)',
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  height: { xs: '420px', md: '480px' },
                  flexShrink: 0,
                }}
              >
                {/* ===== EN-TÊTE AVEC ICÔNE ===== */}
                <Box
                  sx={{
                    height: { xs: 80, md: 110 },
                    backgroundColor: '#F5F5F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 0.5,
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#A0A0A0',
                      fontSize: { xs: '0.45rem', md: '0.55rem' },
                      fontWeight: 500,
                      letterSpacing: 0.5,
                    }}
                  >
                    {item.categorie}
                  </Typography>
                  <Chip
                    label={`⭐ ${item.note}`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '0.5rem',
                      height: 18,
                    }}
                  />
                </Box>

                {/* ===== CONTENU ===== */}
                <CardContent
                  sx={{
                    flexGrow: 1,
                    p: { xs: 1.5, md: 2 },
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  {/* Titre */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: '#2C2C2C',
                      fontSize: { xs: '0.85rem', md: '1rem' },
                      fontFamily: '"Playfair Display", serif',
                      lineHeight: 1.2,
                      mb: 0.5,
                      minHeight: { xs: '40px', md: '48px' },
                    }}
                  >
                    {item.nom}
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#666666',
                      fontSize: { xs: '0.65rem', md: '0.75rem' },
                      lineHeight: 1.3,
                      mb: 1,
                      minHeight: { xs: '32px', md: '40px' },
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.description}
                  </Typography>

                  {/* ===== LISTE "VOUS ALLEZ APPRENDRE" ===== */}
                  <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#A0A0A0',
                        fontWeight: 600,
                        fontSize: { xs: '0.55rem', md: '0.65rem' },
                        letterSpacing: 0.3,
                        display: 'block',
                        mb: 0.3,
                      }}
                    >
                      VOUS ALLEZ APPRENDRE :
                    </Typography>
                    <List dense disablePadding>
                      {item.youWillLearn.slice(0, 4).map((point, index) => (
                        <ListItem key={index} disablePadding sx={{ py: 0.1 }}>
                          <ListItemIcon sx={{ minWidth: 16 }}>
                            <Check sx={{ fontSize: 12, color: '#A0A0A0' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={point}
                            primaryTypographyProps={{
                              variant: 'caption',
                              sx: {
                                color: '#666666',
                                fontSize: { xs: '0.5rem', md: '0.6rem' },
                                lineHeight: 1.2,
                              },
                            }}
                          />
                        </ListItem>
                      ))}
                      {item.youWillLearn.length > 4 && (
                        <ListItem disablePadding sx={{ py: 0.1 }}>
                          <ListItemText
                            primary={`+${item.youWillLearn.length - 4} autres...`}
                            primaryTypographyProps={{
                              variant: 'caption',
                              sx: {
                                color: '#A0A0A0',
                                fontSize: { xs: '0.5rem', md: '0.6rem' },
                                fontStyle: 'italic',
                              },
                            }}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Box>

                  {/* ===== PRIX ET DURÉE ===== */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pt: 0.8,
                      borderTop: '1px solid #F0F0F0',
                      mb: 1,
                      flexShrink: 0,
                    }}
                  >
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999999', display: 'block', fontSize: '0.5rem' }}>
                        Prix
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#2C2C2C',
                          fontWeight: 700,
                          fontSize: { xs: '0.7rem', md: '0.8rem' },
                        }}
                      >
                        {item.prix}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ color: '#999999', display: 'block', fontSize: '0.5rem' }}>
                        Durée
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#666666',
                          fontSize: { xs: '0.65rem', md: '0.75rem' },
                        }}
                      >
                        {item.duree}
                      </Typography>
                    </Box>
                  </Box>

                  {/* ===== BOUTONS ===== */}
                  <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleViewDetails(item.id)}
                      sx={{
                        backgroundColor: '#2C2C2C',
                        color: '#FFFFFF',
                        borderRadius: '50px',
                        py: 0.6,
                        textTransform: 'none',
                        fontSize: { xs: '0.55rem', md: '0.65rem' },
                        '&:hover': { backgroundColor: '#A0A0A0' },
                      }}
                      endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                    >
                      Voir les détails
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenRegister(item)}
                      sx={{
                        borderColor: '#D4A5A0',
                        color: '#2C2C2C',
                        borderRadius: '50px',
                        py: 0.6,
                        textTransform: 'none',
                        fontSize: { xs: '0.55rem', md: '0.65rem' },
                        minWidth: '80px',
                        '&:hover': {
                          borderColor: '#C08A85',
                          backgroundColor: 'rgba(212, 165, 160, 0.1)',
                        },
                      }}
                    >
                      S'inscrire
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* ===== BOUTON DROITE ===== */}
        <IconButton
          onClick={scrollRight}
          sx={{
            position: 'absolute',
            right: { xs: 0, md: 10 },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            backgroundColor: 'rgba(255,255,255,0.9)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: '#FFFFFF',
            },
            display: { xs: 'none', sm: 'flex' },
          }}
        >
          <ArrowForward />
        </IconButton>
      </Box>

      {/* ===== DIALOG D'INSCRIPTION ===== */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif' }}>
              📝 Inscription
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRubrique && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: '12px' }}>
              Vous vous inscrivez à : <strong>{selectedRubrique.nom}</strong>
            </Alert>
          )}

          {formSubmitted ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#2C2C2C' }}>
                Inscription réussie !
              </Typography>
              <Typography variant="body2" sx={{ color: '#666666' }}>
                Vous recevrez un email de confirmation avec tous les détails.
              </Typography>
            </Box>
          ) : (
            <form onSubmit={handleFormSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleFormChange}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
              </Grid>

              <DialogActions sx={{ px: 0, pt: 3 }}>
                <Button onClick={handleCloseDialog} sx={{ color: '#666666' }}>
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    backgroundColor: '#2C2C2C',
                    color: '#FFFFFF',
                    borderRadius: '50px',
                    px: 4,
                    '&:hover': { backgroundColor: '#A0A0A0' },
                  }}
                  startIcon={loading ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : <CheckCircle />}
                >
                  {loading ? 'Envoi...' : 'S\'inscrire'}
                </Button>
              </DialogActions>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== SNACKBAR ===== */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
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

export default RelookingHomme;