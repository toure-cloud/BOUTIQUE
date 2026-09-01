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
} from '@mui/icons-material';
import heroImage from '../assets/images/tibetia.jpeg?url';

const RelookingHomme = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  // Données simplifiées
  const rubriques = [
    {
      id: 1,
      nom: 'Coaching Relooking Homme',
      categorie: 'Coaching',
      description: 'Un accompagnement personnalisé pour révéler votre style.',
      prix: '150 000 CFA',
      duree: '5 séances',
      note: 4.9,
      icon: <Person sx={{ fontSize: 40 }} />,
      youWillLearn: ['Analyser votre morphologie', 'Définir votre identité', 'Choisir les vêtements adaptés'],
    },
    {
      id: 2,
      nom: "Bilan d'Image",
      categorie: 'Bilan',
      description: 'Une analyse complète de votre image.',
      prix: '120 000 CFA',
      duree: '3 séances',
      note: 4.8,
      icon: <Star sx={{ fontSize: 40 }} />,
      youWillLearn: ['Analyse morphologique', 'Étude des couleurs', 'Définition du style'],
    },
    {
      id: 3,
      nom: 'Relooking Sublime',
      categorie: 'Sublime',
      description: 'Une transformation complète de votre image.',
      prix: '200 000 CFA',
      duree: '4 séances',
      note: 5.0,
      icon: <EmojiEvents sx={{ fontSize: 40 }} />,
      youWillLearn: ['Transformation complète', 'Conseils en style', 'Shopping guidé'],
    },
    {
      id: 4,
      nom: 'Relooking Vintage',
      categorie: 'Vintage',
      description: 'Un style vintage revisité avec modernité.',
      prix: '130 000 CFA',
      duree: '3 séances',
      note: 4.7,
      icon: <AccessTime sx={{ fontSize: 40 }} />,
      youWillLearn: ['Codes du vintage', 'Association de pièces', 'Shopping vintage'],
    },
  ];

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

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

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

    setTimeout(() => {
      setFormSubmitted(true);
      setLoading(false);
      setSnackbarMessage('✅ Inscription réussie !');
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

  const handleViewDetails = (rubriqueId) => {
    navigate(`/relooking/homme/${rubriqueId}`);
  };

  return (
    <Box>
      {/* HERO */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 180, md: 250 },
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
            opacity: 0.3,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(44,44,44,0.8) 0%, rgba(44,44,44,0.4) 100%)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography variant="overline" sx={{ color: '#A0A0A0', letterSpacing: 3 }}>
            MADAME TIBETIA
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: '#FFFFFF',
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '1.8rem', md: '3rem' },
            }}
          >
            Relooking Homme
          </Typography>
          <Typography variant="body1" sx={{ color: '#E8E8E8', mt: 1 }}>
            Révélez votre style avec élégance et confiance
          </Typography>
        </Container>
      </Box>

      {/* TITRE */}
      <Box sx={{ py: 3, backgroundColor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#2C2C2C',
              fontFamily: '"Playfair Display", serif',
              textAlign: 'center',
              fontSize: { xs: '1.5rem', md: '2rem' },
            }}
          >
            Nos Rubriques pour Homme
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#666',
              textAlign: 'center',
              maxWidth: 700,
              mx: 'auto',
              mt: 1,
            }}
          >
            Découvrez nos rubriques de relooking conçues pour révéler votre style.
          </Typography>
        </Container>
      </Box>

      {/* CARDS SCROLLABLES */}
      <Box sx={{ position: 'relative', py: 4, px: { xs: 2, md: 4 } }}>
        <IconButton
          onClick={scrollLeft}
          sx={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            backgroundColor: 'rgba(255,255,255,0.9)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: { xs: 'none', sm: 'flex' },
          }}
        >
          <ArrowBack />
        </IconButton>

        <Box
          ref={scrollContainerRef}
          sx={{
            overflowX: 'auto',
            overflowY: 'hidden',
            whiteSpace: 'nowrap',
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-track': { backgroundColor: '#F5F5F5', borderRadius: 10 },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#D0D0D0', borderRadius: 10 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 3,
              width: 'fit-content',
              mx: 'auto',
              px: 4,
            }}
          >
            {rubriques.map((item) => (
              <Card
                key={item.id}
                sx={{
                  minWidth: 280,
                  maxWidth: 280,
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.08)',
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  height: 440,
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    height: 100,
                    backgroundColor: '#F5F5F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  {item.icon}
                  <Typography variant="caption" sx={{ color: '#A0A0A0', mt: 0.5 }}>
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

                <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: '#2C2C2C',
                      fontFamily: '"Playfair Display", serif',
                      fontSize: '1rem',
                      mb: 0.5,
                      minHeight: 48,
                    }}
                  >
                    {item.nom}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#666',
                      fontSize: '0.75rem',
                      mb: 1,
                      minHeight: 40,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.description}
                  </Typography>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="caption" sx={{ color: '#A0A0A0', fontWeight: 600, fontSize: '0.6rem' }}>
                      VOUS ALLEZ APPRENDRE :
                    </Typography>
                    <List dense disablePadding>
                      {item.youWillLearn.slice(0, 3).map((point, index) => (
                        <ListItem key={index} disablePadding sx={{ py: 0.1 }}>
                          <ListItemIcon sx={{ minWidth: 16 }}>
                            <Check sx={{ fontSize: 12, color: '#A0A0A0' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={point}
                            primaryTypographyProps={{
                              variant: 'caption',
                              sx: { color: '#666', fontSize: '0.6rem' },
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #F0F0F0', mb: 1 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999', fontSize: '0.5rem' }}>Prix</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{item.prix}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ color: '#999', fontSize: '0.5rem' }}>Durée</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{item.duree}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleViewDetails(item.id)}
                      sx={{
                        backgroundColor: '#2C2C2C',
                        color: '#FFFFFF',
                        borderRadius: 50,
                        py: 0.6,
                        textTransform: 'none',
                        fontSize: '0.65rem',
                        '&:hover': { backgroundColor: '#555' },
                      }}
                      endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                    >
                      Détails
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenRegister(item)}
                      sx={{
                        borderColor: '#D4A5A0',
                        color: '#2C2C2C',
                        borderRadius: 50,
                        py: 0.6,
                        textTransform: 'none',
                        fontSize: '0.65rem',
                        minWidth: 80,
                        '&:hover': {
                          borderColor: '#C08A85',
                          backgroundColor: 'rgba(212,165,160,0.1)',
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

        <IconButton
          onClick={scrollRight}
          sx={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            backgroundColor: 'rgba(255,255,255,0.9)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: { xs: 'none', sm: 'flex' },
          }}
        >
          <ArrowForward />
        </IconButton>
      </Box>

      {/* DIALOG INSCRIPTION */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            overflow: 'hidden',
          },
        }}
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
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              Vous vous inscrivez à : <strong>{selectedRubrique.nom}</strong>
            </Alert>
          )}

          {formSubmitted ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Inscription réussie !</Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Vous recevrez un email de confirmation.
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
                    size="small"
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
                    size="small"
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
                    size="small"
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
                    size="small"
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
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message"
                    name="message"
                    multiline
                    rows={2}
                    value={formData.message}
                    onChange={handleFormChange}
                    size="small"
                  />
                </Grid>
              </Grid>

              <DialogActions sx={{ px: 0, pt: 3 }}>
                <Button onClick={handleCloseDialog}>Annuler</Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    backgroundColor: '#2C2C2C',
                    color: '#FFFFFF',
                    borderRadius: 50,
                    px: 4,
                    '&:hover': { backgroundColor: '#555' },
                  }}
                >
                  {loading ? <CircularProgress size={20} /> : "S'inscrire"}
                </Button>
              </DialogActions>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbarSeverity} sx={{ borderRadius: 2 }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RelookingHomme;