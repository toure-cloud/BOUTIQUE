// src/pages/RelookingAtelier.jsx
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
  School,
  Star,
  Group,
  Check,
} from '@mui/icons-material';
import heroImage from '../assets/images/tibetia.jpeg?url';

const ATELIERS = [
  {
    id: 1,
    nom: 'Atelier Style et Élégance',
    categorie: 'Style',
    description: "Un atelier collectif pour maîtriser les codes de l'élégance au quotidien.",
    youWillLearn: [
      'Les fondamentaux du style élégant',
      'Comment choisir les bonnes couleurs',
      'Les associations de vêtements réussies',
      'Les accessoires qui font la différence',
      'La posture et la présence',
    ],
    prix: '75 000 CFA',
    duree: '1 journée',
    participants: '2 - 6 personnes',
    note: 4.8,
    icon: <School sx={{ fontSize: 40, color: '#A0A0A0' }} />,
  },
  {
    id: 2,
    nom: 'Atelier Relooking de Groupe',
    categorie: 'Groupe',
    description: 'Un atelier en petit groupe pour une transformation collective.',
    youWillLearn: [
      'Analyse collective des styles',
      'Conseils personnalisés',
      'Shopping en groupe',
      'Défilé de mode',
      'Photos professionnelles',
    ],
    prix: '120 000 CFA',
    duree: '2 jours',
    participants: '2 - 6 personnes',
    note: 4.9,
    icon: <Group sx={{ fontSize: 40, color: '#A0A0A0' }} />,
  },
  {
    id: 3,
    nom: 'Masterclass Image et Confiance',
    categorie: 'Masterclass',
    description: 'Une masterclass intensive pour révéler votre charisme et votre image.',
    youWillLearn: [
      "Psychologie de l'image",
      'Communication non verbale',
      'Style et élégance',
      'Prise de parole',
      'Développement personnel',
    ],
    prix: '180 000 CFA',
    duree: '3 jours',
    participants: '2 - 6 personnes',
    note: 5.0,
    icon: <Star sx={{ fontSize: 40, color: '#A0A0A0' }} />,
  },
];

const RelookingAtelier = () => {
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
    nb_personnes: 2,
    message: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleOpenDetails = (item) => { setSelected(item); setDialogOpen(true); };
  const handleCloseDialog = () => { setDialogOpen(false); setSelected(null); };
  const handleFormChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('Formulaire soumis:', { ...formData, atelier: selected?.nom });
    setFormSubmitted(true);
    setSnackbarOpen(true);
    setTimeout(() => {
      setDialogOpen(false);
      setFormSubmitted(false);
      setFormData({ nom: '', prenom: '', email: '', telephone: '', date: '', nb_personnes: 2, message: '' });
    }, 3000);
  };

  return (
    <Box>
      <Box sx={{ position: 'relative', height: { xs: '180px', md: '250px' }, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#2C2C2C' }}>
        <Box component="img" src={heroImage} alt="Ateliers" sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', opacity: 0.3 }} />
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(44,44,44,0.8) 0%, rgba(44,44,44,0.4) 100%)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography variant="overline" sx={{ color: '#A0A0A0', letterSpacing: 3, fontWeight: 600, fontSize: '0.7rem', display: 'block', mb: 1 }}>MADAME TIBETIA</Typography>
          <Typography variant="h2" sx={{ fontWeight: 700, color: '#FFFFFF', fontFamily: '"Playfair Display", serif', fontSize: { xs: '1.8rem', md: '3rem' } }}>Ateliers Relooking</Typography>
          <Typography variant="body1" sx={{ color: '#E8E8E8', mt: 1, fontSize: { xs: '0.9rem', md: '1.1rem' } }}>Apprenez et transformez-vous en groupe (2 à 6 personnes)</Typography>
        </Container>
      </Box>

      <Box sx={{ py: 3, backgroundColor: '#FFFFFF', borderBottom: '1px solid #F0F0F0' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C2C2C', fontFamily: '"Playfair Display", serif', mb: 1, textAlign: 'center', fontSize: { xs: '1.5rem', md: '2rem' } }}>Nos Ateliers en Groupe</Typography>
          <Typography variant="body1" sx={{ color: '#666666', textAlign: 'center', maxWidth: '700px', mx: 'auto', lineHeight: 1.6, fontSize: { xs: '0.85rem', md: '1rem' } }}>Rejoignez nos ateliers collectifs (2 à 6 personnes) pour apprendre, échanger et vous transformer.</Typography>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 4 }, overflowX: 'auto', overflowY: 'hidden', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch', '&::-webkit-scrollbar': { height: '6px' }, '&::-webkit-scrollbar-track': { backgroundColor: '#F5F5F5', borderRadius: '10px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#D0D0D0', borderRadius: '10px' }, '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#A0A0A0' } }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, width: 'fit-content', mx: 'auto' }}>
          {ATELIERS.map((item) => (
            <Card key={item.id} sx={{ minWidth: { xs: '250px', sm: '280px', md: '300px' }, maxWidth: { xs: '250px', sm: '280px', md: '300px' }, borderRadius: '16px', overflow: 'hidden', transition: 'transform 0.3s ease, box-shadow 0.3s ease', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }, display: 'flex', flexDirection: 'column', height: { xs: '440px', md: '500px' }, flexShrink: 0 }}>
              <Box sx={{ height: { xs: 80, md: 110 }, backgroundColor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 0.5, position: 'relative', flexShrink: 0 }}>
                {item.icon}
                <Typography variant="caption" sx={{ color: '#A0A0A0', fontSize: { xs: '0.45rem', md: '0.55rem' }, fontWeight: 500, letterSpacing: 0.5 }}>{item.categorie}</Typography>
                <Chip label={`⭐ ${item.note}`} size="small" sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#FFFFFF', fontWeight: 600, fontSize: '0.5rem', height: 18 }} />
              </Box>
              <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, md: 2 }, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2C2C2C', fontSize: { xs: '0.85rem', md: '1rem' }, fontFamily: '"Playfair Display", serif', lineHeight: 1.2, mb: 0.5, minHeight: { xs: '40px', md: '48px' } }}>{item.nom}</Typography>
                <Typography variant="body2" sx={{ color: '#666666', fontSize: { xs: '0.65rem', md: '0.75rem' }, lineHeight: 1.3, mb: 1, minHeight: { xs: '32px', md: '40px' }, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</Typography>
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                  <Typography variant="caption" sx={{ color: '#A0A0A0', fontWeight: 600, fontSize: { xs: '0.55rem', md: '0.65rem' }, letterSpacing: 0.3, display: 'block', mb: 0.3 }}>VOUS ALLEZ APPRENDRE :</Typography>
                  <List dense disablePadding>
                    {item.youWillLearn.slice(0, 4).map((point, index) => (
                      <ListItem key={index} disablePadding sx={{ py: 0.1 }}>
                        <ListItemIcon sx={{ minWidth: 16 }}><Check sx={{ fontSize: 12, color: '#A0A0A0' }} /></ListItemIcon>
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, pt: 0.8, borderTop: '1px solid #F0F0F0', mb: 1, flexShrink: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: '#999999', fontSize: '0.5rem' }}>Prix</Typography>
                    <Typography variant="body2" sx={{ color: '#2C2C2C', fontWeight: 700, fontSize: { xs: '0.7rem', md: '0.8rem' } }}>{item.prix}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: '#999999', fontSize: '0.5rem' }}>Durée</Typography>
                    <Typography variant="body2" sx={{ color: '#666666', fontSize: { xs: '0.65rem', md: '0.75rem' } }}>{item.duree}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: '#999999', fontSize: '0.5rem' }}>Participants</Typography>
                    <Typography variant="body2" sx={{ color: '#666666', fontSize: { xs: '0.65rem', md: '0.75rem' } }}>{item.participants}</Typography>
                  </Box>
                </Box>
                <Button variant="contained" fullWidth onClick={() => handleOpenDetails(item)} sx={{ backgroundColor: '#2C2C2C', color: '#FFFFFF', borderRadius: '50px', py: 0.6, textTransform: 'none', fontSize: { xs: '0.6rem', md: '0.7rem' }, '&:hover': { backgroundColor: '#A0A0A0' }, flexShrink: 0 }} endIcon={<ArrowForward sx={{ fontSize: 14 }} />}>Voir les détails</Button>
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
                <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif' }}>{selected.nom}</Typography>
                <IconButton onClick={handleCloseDialog}><Close /></IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <Chip label={selected.categorie} sx={{ backgroundColor: '#F5F5F5', color: '#666666', fontWeight: 500 }} />
                  <Chip label={`⭐ ${selected.note}`} sx={{ backgroundColor: '#FFF8E1', color: '#F57C00', fontWeight: 600 }} />
                </Box>
                <Typography variant="body1" sx={{ color: '#666666', mb: 2 }}>{selected.description}</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2C2C2C', mb: 1 }}>VOUS ALLEZ APPRENDRE :</Typography>
                <List dense>
                  {selected.youWillLearn.map((point, index) => (
                    <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}><CheckCircle sx={{ fontSize: 18, color: '#4CAF50' }} /></ListItemIcon>
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
                  <Paper sx={{ px: 3, py: 1.5, borderRadius: '12px', backgroundColor: '#F5F5F5' }}><Typography variant="caption" sx={{ color: '#999999', display: 'block' }}>Prix</Typography><Typography variant="h6" sx={{ color: '#2C2C2C', fontWeight: 700 }}>{selected.prix}</Typography></Paper>
                  <Paper sx={{ px: 3, py: 1.5, borderRadius: '12px', backgroundColor: '#F5F5F5' }}><Typography variant="caption" sx={{ color: '#999999', display: 'block' }}>Durée</Typography><Typography variant="body1" sx={{ color: '#2C2C2C' }}>{selected.duree}</Typography></Paper>
                  <Paper sx={{ px: 3, py: 1.5, borderRadius: '12px', backgroundColor: '#F5F5F5' }}><Typography variant="caption" sx={{ color: '#999999', display: 'block' }}>Participants</Typography><Typography variant="body1" sx={{ color: '#2C2C2C' }}>{selected.participants}</Typography></Paper>
                </Box>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C2C2C', mb: 2 }}>Je souhaite participer à cet atelier</Typography>
                <Typography variant="body2" sx={{ color: '#999999', mb: 3 }}>Remplissez le formulaire ci-dessous pour réserver votre place.</Typography>
                {formSubmitted ? <Alert icon={<CheckCircle fontSize="inherit" />} severity="success" sx={{ borderRadius: '12px' }}>Votre réservation a été envoyée avec succès !</Alert> : (
                  <form onSubmit={handleFormSubmit}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Nom" name="nom" value={formData.nom} onChange={handleFormChange} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Prénom" name="prenom" value={formData.prenom} onChange={handleFormChange} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleFormChange} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Téléphone" name="telephone" value={formData.telephone} onChange={handleFormChange} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Nombre de participants" name="nb_personnes" type="number" value={formData.nb_personnes} onChange={handleFormChange} required inputProps={{ min: 2, max: 6 }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Date souhaitée" name="date" type="date" value={formData.date} onChange={handleFormChange} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>
                      <Grid item xs={12}><TextField fullWidth label="Message" name="message" multiline rows={3} value={formData.message} onChange={handleFormChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>
                    </Grid>
                    <DialogActions sx={{ px: 0, pt: 2 }}>
                      <Button onClick={handleCloseDialog} sx={{ color: '#666666' }}>Annuler</Button>
                      <Button type="submit" variant="contained" sx={{ backgroundColor: '#2C2C2C', color: '#FFFFFF', borderRadius: '50px', px: 4, '&:hover': { backgroundColor: '#A0A0A0' } }}>Réserver</Button>
                    </DialogActions>
                  </form>
                )}
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', borderRadius: '12px' }}>Votre réservation a été envoyée avec succès !</Alert>
      </Snackbar>
    </Box>
  );
};

export default RelookingAtelier;