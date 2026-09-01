// src/pages/RelookingFemme.jsx
import React, { useState } from 'react';
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
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Grid,
} from '@mui/material';
import {
  ArrowForward,
  Close,
  CheckCircle,
  Person,
  Face,
  Style,
  Spa,
  Brush,
  ShoppingBag,
  Palette,
  Check,
} from '@mui/icons-material';
import heroImage from '../assets/images/tibetia.jpeg?url';

const RUBRIQUES = [
  {
    id: 1,
    nom: 'Relooking Complet',
    categorie: 'Complet',
    description: 'Une transformation complète de votre image.',
    youWillLearn: [
      'Analyse complète de votre morphologie',
      'Définition de votre style personnel',
      'Conseils en coiffure et maquillage',
      'Shopping accompagné',
      'Restyling de votre garde-robe',
    ],
    prix: '250 000 CFA',
    duree: '5 séances',
    note: 4.9,
    icon: <Person sx={{ fontSize: 40, color: '#A0A0A0' }} />,
  },
  {
    id: 2,
    nom: 'Soin du Visage',
    categorie: 'Visage',
    description: "Un soin personnalisé pour révéler l'éclat de votre visage.",
    youWillLearn: [
      'Diagnostic de votre type de peau',
      'Nettoyage en profondeur',
      'Masque personnalisé',
      'Massage du visage',
      "Conseils pour l'entretien",
    ],
    prix: '80 000 CFA',
    duree: '1 séance',
    note: 4.7,
    icon: <Face sx={{ fontSize: 40, color: '#A0A0A0' }} />,
  },
  {
    id: 3,
    nom: 'Conseil Vestimentaire',
    categorie: 'Vestimentaire',
    description: 'Des conseils pour trouver votre style vestimentaire.',
    youWillLearn: [
      'Analyse de votre morphologie',
      'Définition de votre palette de couleurs',
      'Création de votre garde-robe idéale',
      'Conseils pour les associations',
      'Shopping accompagné',
    ],
    prix: '120 000 CFA',
    duree: '2 séances',
    note: 4.8,
    icon: <Style sx={{ fontSize: 40, color: '#A0A0A0' }} />,
  },
  {
    id: 4,
    nom: 'Coiffure et Style',
    categorie: 'Coiffure',
    description: 'Des conseils pour une coiffure qui vous met en valeur.',
    youWillLearn: [
      'Analyse de votre forme de visage',
      'Choix de la coupe adaptée',
      "Conseils pour l'entretien",
      'Techniques de coiffage',
      'Sélection de produits',
    ],
    prix: '60 000 CFA',
    duree: '1 séance',
    note: 4.6,
    icon: <Spa sx={{ fontSize: 40, color: '#A0A0A0' }} />,
  },
  {
    id: 5,
    nom: 'Maquillage Professionnel',
    categorie: 'Maquillage',
    description: 'Apprenez les techniques de maquillage professionnel.',
    youWillLearn: [
      'Diagnostic de votre type de peau',
      'Choix des produits adaptés',
      'Techniques de maquillage de jour',
      'Maquillage de soirée',
      "Conseils pour l'entretien",
    ],
    prix: '70 000 CFA',
    duree: '1 séance',
    note: 4.8,
    icon: <Brush sx={{ fontSize: 40, color: '#A0A0A0' }} />,
  },
  {
    id: 6,
    nom: 'Personnel Shopping',
    categorie: 'Shopping',
    description: 'Un accompagnement personnalisé pour vos achats.',
    youWillLearn: [
      'Analyse de votre style',
      'Définition de vos besoins',
      'Sélection de boutiques',
      'Shopping guidé',
      'Conseils pour les associations',
    ],
    prix: '150 000 CFA',
    duree: '3 séances',
    note: 4.9,
    icon: <ShoppingBag sx={{ fontSize: 40, color: '#A0A0A0' }} />,
  },
  {
    id: 7,
    nom: 'Analyse Colorimétrie',
    categorie: 'Colorimétrie',
    description: 'Découvrez les couleurs qui vous mettent en valeur.',
    youWillLearn: [
      'Analyse de votre carnation',
      'Détermination de votre saison colorimétrique',
      'Choix des couleurs adaptées',
      'Palette personnalisée',
      'Conseils pour vos choix vestimentaires',
    ],
    prix: '90 000 CFA',
    duree: '1 séance',
    note: 4.7,
    icon: <Palette sx={{ fontSize: 40, color: '#A0A0A0' }} />,
  },
];

const RelookingFemme = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selected, setSelected] = useState(null);
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

  const handleOpenDetails = (item) => {
    setSelected(item);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelected(null);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('Formulaire soumis:', { ...formData, rubrique: selected?.nom });
    setFormSubmitted(true);
    setSnackbarOpen(true);
    setTimeout(() => {
      setDialogOpen(false);
      setFormSubmitted(false);
      setFormData({ nom: '', prenom: '', email: '', telephone: '', date: '', message: '' });
    }, 3000);
  };

  return (
    <Box>
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
          alt="Relooking Femme"
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
          <Typography variant="h2" sx={{ fontWeight: 700, color: '#FFFFFF', fontFamily: '"Playfair Display", serif', fontSize: { xs: '1.8rem', md: '3rem' } }}>Relooking Femme</Typography>
          <Typography variant="body1" sx={{ color: '#E8E8E8', mt: 1, fontSize: { xs: '0.9rem', md: '1.1rem' } }}>Révélez votre élégance et votre beauté naturelle</Typography>
        </Container>
      </Box>

      <Box sx={{ py: 3, backgroundColor: '#FFFFFF', borderBottom: '1px solid #F0F0F0' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C2C2C', fontFamily: '"Playfair Display", serif', mb: 1, textAlign: 'center', fontSize: { xs: '1.5rem', md: '2rem' } }}>Nos Rubriques de Relooking</Typography>
          <Typography variant="body1" sx={{ color: '#666666', textAlign: 'center', maxWidth: '700px', mx: 'auto', lineHeight: 1.6, fontSize: { xs: '0.85rem', md: '1rem' } }}>Découvrez nos 7 rubriques de relooking conçues pour révéler votre beauté et votre élégance.</Typography>
        </Container>
      </Box>

      <Box
        sx={{
          py: { xs: 3, md: 5 },
          px: { xs: 2, md: 4 },
          overflowX: 'auto',
          overflowY: 'hidden',
          whiteSpace: 'nowrap',
          WebkitOverflowScrolling: 'touch',
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

              <CardContent
                sx={{
                  flexGrow: 1,
                  p: { xs: 1.5, md: 2 },
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
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
                          slotProps={{
                            primary: {
                              variant: 'caption',
                              sx: {
                                color: '#666666',
                                fontSize: { xs: '0.5rem', md: '0.6rem' },
                                lineHeight: 1.2,
                              },
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                    {item.youWillLearn.length > 4 && (
                      <ListItem disablePadding sx={{ py: 0.1 }}>
                        <ListItemText
                          primary={`+${item.youWillLearn.length - 4} autres...`}
                          slotProps={{
                            primary: {
                              variant: 'caption',
                              sx: {
                                color: '#A0A0A0',
                                fontSize: { xs: '0.5rem', md: '0.6rem' },
                                fontStyle: 'italic',
                              },
                            },
                          }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>

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

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleOpenDetails(item)}
                  sx={{
                    backgroundColor: '#2C2C2C',
                    color: '#FFFFFF',
                    borderRadius: '50px',
                    py: 0.6,
                    textTransform: 'none',
                    fontSize: { xs: '0.6rem', md: '0.7rem' },
                    '&:hover': { backgroundColor: '#A0A0A0' },
                    flexShrink: 0,
                  }}
                  endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                >
                  Voir les détails
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : '16px',
            overflow: 'hidden',
          },
        }}
      >
        {selected && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif' }}>
                  {selected.nom}
                </Typography>
                <IconButton onClick={handleCloseDialog}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={selected.categorie}
                    sx={{ backgroundColor: '#F5F5F5', color: '#666666', fontWeight: 500 }}
                  />
                  <Chip
                    label={`⭐ ${selected.note}`}
                    sx={{ backgroundColor: '#FFF8E1', color: '#F57C00', fontWeight: 600 }}
                  />
                </Box>

                <Typography variant="body1" sx={{ color: '#666666', mb: 2 }}>
                  {selected.description}
                </Typography>

                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: '#2C2C2C',
                    mb: 1,
                  }}
                >
                  VOUS ALLEZ APPRENDRE :
                </Typography>
                <List dense>
                  {selected.youWillLearn.map((point, index) => (
                    <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CheckCircle sx={{ fontSize: 18, color: '#4CAF50' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={point}
                        slotProps={{
                          primary: {
                            variant: 'body2',
                            sx: { color: '#666666' },
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Paper sx={{ px: 3, py: 1.5, borderRadius: '12px', backgroundColor: '#F5F5F5' }}>
                    <Typography variant="caption" sx={{ color: '#999999', display: 'block' }}>
                      Prix
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#2C2C2C', fontWeight: 700 }}>
                      {selected.prix}
                    </Typography>
                  </Paper>
                  <Paper sx={{ px: 3, py: 1.5, borderRadius: '12px', backgroundColor: '#F5F5F5' }}>
                    <Typography variant="caption" sx={{ color: '#999999', display: 'block' }}>
                      Durée
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C2C2C' }}>
                      {selected.duree}
                    </Typography>
                  </Paper>
                </Box>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C', mb: 2 }}>
                  Je suis intéressé(e) par cette rubrique
                </Typography>
                <Typography variant="body2" sx={{ color: '#999999', mb: 3 }}>
                  Remplissez le formulaire ci-dessous et nous vous recontacterons.
                </Typography>

                {formSubmitted ? (
                  <Alert
                    icon={<CheckCircle fontSize="inherit" />}
                    severity="success"
                    sx={{ borderRadius: '12px' }}
                  >
                    Votre demande a été envoyée avec succès !
                  </Alert>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                          label="Message"
                          name="message"
                          multiline
                          rows={3}
                          value={formData.message}
                          onChange={handleFormChange}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                      </Grid>
                    </Grid>

                    <DialogActions sx={{ px: 0, pt: 2 }}>
                      <Button onClick={handleCloseDialog} sx={{ color: '#666666' }}>
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{
                          backgroundColor: '#2C2C2C',
                          color: '#FFFFFF',
                          borderRadius: '50px',
                          px: 4,
                          '&:hover': { backgroundColor: '#A0A0A0' },
                        }}
                      >
                        Envoyer
                      </Button>
                    </DialogActions>
                  </form>
                )}
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: '100%', borderRadius: '12px' }}
        >
          Votre demande a été envoyée avec succès !
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RelookingFemme;