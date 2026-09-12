import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container, Typography, Box, Grid, Card, CardContent, Button, Chip,
  Divider, Paper, TextField, Alert, Snackbar, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, useTheme, useMediaQuery,
  CircularProgress, Fade, Stack, Avatar,
} from '@mui/material';
import {
  ArrowBack, CheckCircle, Check, Close, Schedule, WorkspacePremium,
  LocalOffer, ArrowForward, Star, Spa,
} from '@mui/icons-material';
import heroImage from '../assets/images/tibetia.jpeg';
import { relookingService } from '../services/relookingService';

// ============================================================
// DONNÉES COMPLÈTES FEMME
// ============================================================
const RUBRIQUES = {
  1: {
    id: 1,
    nom: 'Relooking Complet',
    categorie: 'Complet',
    description: 'Une transformation complète de votre image.',
    description_detail: `
Une transformation complète de votre image pour révéler votre beauté naturelle.

## Ce que comprend cette prestation

• Analyse complète de votre morphologie
• Définition de votre style personnel
• Conseils en coiffure et maquillage
• Shopping accompagné avec un expert
• Restyling de votre garde-robe

## Programme détaillé

Séance 1 - Bilan complet (2h30)
- Analyse de votre morphologie
- Définition de vos objectifs
- Diagnostic de votre style

Séance 2 - Conseil vestimentaire (2h30)
- Définition de votre palette de couleurs
- Choix des pièces adaptées
- Conseil en accessoires

Séance 3 - Coiffure et maquillage (2h30)
- Analyse de votre visage
- Choix de la coupe adaptée
- Techniques de maquillage

Séance 4 - Shopping accompagné (3h)
- Sélection des boutiques
- Choix des pièces clés
- Essayage et conseils

Séance 5 - Finalisation (2h)
- Bilan de la transformation
- Guide de style personnalisé
- Photos professionnelles
    `,
    prix: '250 000 CFA',
    duree: '5 séances',
    note: 4.9,
    nb_avis: 87,
    youWillLearn: [
      'Analyser votre morphologie et votre style',
      'Définir votre palette de couleurs idéale',
      'Choisir les vêtements qui vous mettent en valeur',
      'Maîtriser les techniques de maquillage',
      'Adopter une coiffure qui vous sublime',
    ],
    avantages: [
      'Accompagnement personnalisé',
      'Guide de style exclusif',
      'Photos avant/après',
      'Suivi sur 3 mois',
    ],
  },
  2: {
    id: 2,
    nom: 'Soin du Visage',
    categorie: 'Visage',
    description: "Un soin personnalisé pour révéler l'éclat de votre visage.",
    description_detail: `
Un soin du visage professionnel adapté à votre type de peau.

## Ce que comprend cette prestation

• Diagnostic de votre type de peau
• Nettoyage en profondeur
• Masque personnalisé
• Massage du visage
• Conseils pour l'entretien

## Programme détaillé

Séance 1 - Diagnostic (1h30)
- Analyse de votre peau
- Identification de vos besoins

Séance 2 - Soin complet (1h30)
- Nettoyage en profondeur
- Gommage doux
- Masque adapté

Séance 3 - Massage et finalisation (1h)
- Massage relaxant
- Application de soins
- Conseils d'entretien
    `,
    prix: '80 000 CFA',
    duree: '1 séance',
    note: 4.7,
    nb_avis: 45,
    youWillLearn: [
      'Identifier votre type de peau',
      'Réaliser un nettoyage en profondeur',
      'Appliquer un masque adapté',
      'Pratiquer un massage du visage',
      'Entretenir votre peau au quotidien',
    ],
    avantages: [
      'Diagnostic complet',
      'Produits professionnels',
      'Routine personnalisée',
      'Suivi post-soin',
    ],
  },
  3: {
    id: 3,
    nom: 'Conseil Vestimentaire',
    categorie: 'Vestimentaire',
    description: 'Des conseils pour trouver votre style vestimentaire.',
    description_detail: `
Un accompagnement personnalisé pour révéler votre style vestimentaire.

## Ce que comprend cette prestation

• Analyse de votre morphologie
• Définition de votre palette de couleurs
• Création de votre garde-robe idéale
• Conseils pour les associations
• Shopping accompagné

## Programme détaillé

Séance 1 - Analyse (2h)
- Étude de la morphologie
- Test colorimétrique

Séance 2 - Shopping (2h)
- Boutiques sélectionnées
- Essayage et conseils
- Choix des pièces clés
    `,
    prix: '120 000 CFA',
    duree: '2 séances',
    note: 4.8,
    nb_avis: 62,
    youWillLearn: [
      'Connaître votre morphologie',
      'Identifier votre palette de couleurs',
      'Construire une garde-robe idéale',
      'Associer les vêtements avec élégance',
      'Faire du shopping avec méthode',
    ],
    avantages: [
      'Analyse morphologique',
      'Palette personnalisée',
      'Shopping guidé',
      'Liste de boutiques recommandées',
    ],
  },
  4: {
    id: 4,
    nom: 'Coiffure et Style',
    categorie: 'Coiffure',
    description: 'Des conseils pour une coiffure qui vous met en valeur.',
    description_detail: `
Des conseils professionnels pour une coiffure adaptée à votre visage.

## Ce que comprend cette prestation

• Analyse de votre forme de visage
• Choix de la coupe adaptée
• Conseils pour l'entretien
• Techniques de coiffage
• Sélection de produits

## Programme détaillé

Séance unique (2h)
- Analyse de la forme du visage
- Choix de la coupe
- Démonstration de coiffage
- Conseils produits
    `,
    prix: '60 000 CFA',
    duree: '1 séance',
    note: 4.6,
    nb_avis: 33,
    youWillLearn: [
      'Analyser votre forme de visage',
      'Choisir une coupe adaptée',
      'Entretenir votre coiffure',
      'Maîtriser les techniques de coiffage',
      'Sélectionner les bons produits',
    ],
    avantages: [
      'Analyse personnalisée',
      'Conseils sur-mesure',
      'Fiches techniques',
      'Suivi par email',
    ],
  },
  5: {
    id: 5,
    nom: 'Maquillage Professionnel',
    categorie: 'Maquillage',
    description: 'Apprenez les techniques de maquillage professionnel.',
    description_detail: `
Un cours de maquillage professionnel adapté à votre style.

## Ce que comprend cette prestation

• Diagnostic de votre type de peau
• Choix des produits adaptés
• Techniques de maquillage de jour
• Maquillage de soirée
• Conseils pour l'entretien

## Programme détaillé

Séance 1 - Diagnostic (1h30)
- Analyse de la peau
- Choix des produits

Séance 2 - Maquillage jour (1h30)
- Techniques naturelles
- Application

Séance 3 - Maquillage soirée (1h30)
- Techniques sophistiquées
- Mise en pratique
    `,
    prix: '70 000 CFA',
    duree: '1 séance',
    note: 4.8,
    nb_avis: 51,
    youWillLearn: [
      'Diagnostiquer votre type de peau',
      'Choisir les produits adaptés',
      'Maîtriser le maquillage de jour',
      'Réaliser un maquillage de soirée',
      'Entretenir vos produits',
    ],
    avantages: [
      'Cours personnalisé',
      'Produits fournis',
      'Fiches techniques',
      'Suivi à distance',
    ],
  },
  6: {
    id: 6,
    nom: 'Personnel Shopping',
    categorie: 'Shopping',
    description: 'Un accompagnement personnalisé pour vos achats.',
    description_detail: `
Un accompagnement shopping personnalisé pour révéler votre style.

## Ce que comprend cette prestation

• Analyse de votre style
• Définition de vos besoins
• Sélection de boutiques
• Shopping guidé
• Conseils pour les associations

## Programme détaillé

Séance 1 - Préparation (2h)
- Analyse de votre garde-robe
- Définition des besoins

Séance 2 - Shopping (3h)
- Boutiques sélectionnées
- Essayage et conseils

Séance 3 - Associations (2h)
- Création de looks
- Conseils photos
    `,
    prix: '150 000 CFA',
    duree: '3 séances',
    note: 4.9,
    nb_avis: 76,
    youWillLearn: [
      'Analyser votre style',
      'Définir vos besoins réels',
      'Choisir les bonnes boutiques',
      'Faire du shopping efficacement',
      'Créer des associations gagnantes',
    ],
    avantages: [
      'Analyse complète',
      'Shopping accompagné',
      'Lookbook personnalisé',
      'Conseils photos',
    ],
  },
  7: {
    id: 7,
    nom: 'Analyse Colorimétrie',
    categorie: 'Colorimétrie',
    description: 'Découvrez les couleurs qui vous mettent en valeur.',
    description_detail: `
Une analyse colorimétrique complète pour révéler vos couleurs idéales.

## Ce que comprend cette prestation

• Analyse de votre carnation
• Détermination de votre saison colorimétrique
• Choix des couleurs adaptées
• Palette personnalisée
• Conseils pour vos choix vestimentaires

## Programme détaillé

Séance unique (2h)
- Analyse de la carnation
- Test des drappes
- Définition de la saison
- Remise de la palette personnalisée
    `,
    prix: '90 000 CFA',
    duree: '1 séance',
    note: 4.7,
    nb_avis: 41,
    youWillLearn: [
      'Analyser votre carnation',
      'Déterminer votre saison colorimétrique',
      'Identifier vos couleurs idéales',
      'Construire votre palette personnelle',
      'Appliquer vos couleurs au quotidien',
    ],
    avantages: [
      'Analyse professionnelle',
      'Palette personnalisée',
      'Guide des couleurs',
      'Conseils vestimentaires',
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
          return <Typography key={index} variant="h6" sx={{ mt: index === 0 ? 0 : 3, mb: 1.5, fontWeight: 700, color: '#1a1a1a', fontFamily: '"Playfair Display", serif' }}>{trimmed.replace('## ', '')}</Typography>;
        }
        if (trimmed.startsWith('• ')) {
          return (
            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 0.5 }}>
              <Box sx={{ mt: 0.8, width: 6, height: 6, borderRadius: '50%', bgcolor: '#2C2C2C', flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.7 }}>{trimmed.replace('• ', '')}</Typography>
            </Box>
          );
        }
        if (trimmed.startsWith('- ')) {
          return (
            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, pl: 1.5, py: 0.3 }}>
              <Check sx={{ fontSize: 16, color: '#4CAF50', mt: 0.3, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>{trimmed.replace('- ', '')}</Typography>
            </Box>
          );
        }
        if (/^Séance\s+\d+/i.test(trimmed)) {
          return (
            <Box key={index} sx={{ mt: 2.5, mb: 0.75, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Schedule sx={{ fontSize: 18, color: '#888' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a' }}>{trimmed}</Typography>
            </Box>
          );
        }
        return <Typography key={index} variant="body2" sx={{ color: '#555', lineHeight: 1.8, mb: 1.25 }}>{trimmed}</Typography>;
      })}
    </Box>
  );
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
const RelookingFemmeDetail = () => {
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const rubrique = RUBRIQUES[id];

  const [registerOpen, setRegisterOpen] = useState(false);
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', telephone: '', date: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [loading, setLoading] = useState(false);

  if (!rubrique) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <Alert severity="error" sx={{ borderRadius: 3, mb: 3, maxWidth: 480, mx: 'auto' }}>Rubrique non trouvée</Alert>
        <Button component={Link} to="/relooking/femme" startIcon={<ArrowBack />} variant="outlined" sx={{ borderRadius: 50 }}>Retour aux rubriques</Button>
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
  const handleFormChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await relookingService.inscrire({
        type: 'FEMME',
        rubrique_id: rubrique.id,
        rubrique_nom: rubrique.nom,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        date_souhaitee: formData.date,
        message: formData.message,
        prix: rubrique.prix,
        duree: rubrique.duree,
      });
      setFormSubmitted(true);
      setSnackbarMessage('✅ Inscription réussie ! Vous recevrez un email de confirmation.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setTimeout(() => handleCloseRegister(), 2200);
    } catch (error) {
      console.error('❌ Erreur inscription:', error.response?.data || error.message);
      setSnackbarMessage('❌ Erreur lors de l\'inscription.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ bgcolor: '#FAFAFA', minHeight: '100vh' }}>
      {/* HERO */}
      <Box sx={{ position: 'relative', height: { xs: 220, md: 300 }, display: 'flex', alignItems: 'flex-end', overflow: 'hidden', bgcolor: '#1a1a1a' }}>
        <Box component="img" src={heroImage} alt={rubrique.nom} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', opacity: 0.3 }} />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(26,26,26,0.3) 0%, rgba(26,26,26,0.85) 100%)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pb: { xs: 3, md: 4 } }}>
          <Chip label="RELOOKING FEMME" size="small" sx={{ mb: 1.5, bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 600, letterSpacing: 1.5, fontSize: '0.7rem', height: 26 }} />
          <Typography variant="h2" sx={{ fontWeight: 700, color: '#fff', fontFamily: '"Playfair Display", serif', fontSize: { xs: '1.75rem', md: '2.75rem' }, mb: 2 }}>{rubrique.nom}</Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Chip icon={<Star sx={{ color: '#FFB400 !important', fontSize: 16 }} />} label={`${rubrique.note} · ${rubrique.nb_avis} avis`} sx={{ bgcolor: 'rgba(255,255,255,0.95)', fontWeight: 600 }} />
            <Chip label={rubrique.categorie} sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600 }} />
          </Stack>
        </Container>
      </Box>

      {/* CONTENU */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Button component={Link} to="/relooking/femme" startIcon={<ArrowBack />} sx={{ mb: 4, color: '#666' }}>Retour aux rubriques</Button>
        <Grid container spacing={4} sx={{ alignItems: "flex-start" }}>
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'rgba(0,0,0,0.08)', bgcolor: '#fff', height: '100%' }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5, fontFamily: '"Playfair Display", serif', color: '#1a1a1a' }}>Description détaillée</Typography>
                  <RichDescription content={rubrique.description_detail} />
                </CardContent>
              </Card>
              <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'rgba(0,0,0,0.08)', bgcolor: '#fff' }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5, fontFamily: '"Playfair Display", serif', color: '#1a1a1a' }}>Ce que vous allez apprendre</Typography>
                  <Stack spacing={1.75}>
                    {rubrique.youWillLearn.map((point, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: 'rgba(76, 175, 80, 0.12)', color: '#2e7d32' }}><CheckCircle sx={{ fontSize: 16 }} /></Avatar>
                        <Typography variant="body2" sx={{ color: '#444', pt: 0.4 }}>{point}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'rgba(0,0,0,0.08)', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
                <Box sx={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2C2C2C 100%)', px: 3, py: 2.5, color: '#fff' }}>
                  <Typography variant="overline" sx={{ opacity: 0.7, letterSpacing: 1.5, fontSize: '0.7rem' }}>Résumé de la prestation</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: '"Playfair Display", serif', mt: 0.5, fontSize: '1.25rem' }}>{rubrique.nom}</Typography>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2.5} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.06)', color: '#1a1a1a', width: 42, height: 42 }}><LocalOffer sx={{ fontSize: 20 }} /></Avatar>
                      <Box><Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>Prix</Typography><Typography variant="h6" fontWeight={700} color="#1a1a1a">{rubrique.prix}</Typography></Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.06)', color: '#1a1a1a', width: 42, height: 42 }}><Schedule sx={{ fontSize: 20 }} /></Avatar>
                      <Box><Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>Durée</Typography><Typography variant="body1" fontWeight={600} color="#1a1a1a">{rubrique.duree}</Typography></Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.06)', color: '#1a1a1a', width: 42, height: 42 }}><WorkspacePremium sx={{ fontSize: 20 }} /></Avatar>
                      <Box><Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>Note</Typography><Typography variant="body1" fontWeight={600} color="#1a1a1a">{rubrique.note}/5 ({rubrique.nb_avis} avis)</Typography></Box>
                    </Box>
                  </Stack>
                  <Divider sx={{ mb: 2.5 }} />
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: '#1a1a1a' }}>Avantages inclus</Typography>
                  <Stack spacing={1} sx={{ mb: 3.5 }}>
                    {rubrique.avantages.map((avantage, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Check sx={{ fontSize: 17, color: '#4CAF50' }} />
                        <Typography variant="body2" color="#555">{avantage}</Typography>
                      </Box>
                    ))}
                  </Stack>
                  <Button variant="contained" fullWidth size="large" onClick={handleOpenRegister} endIcon={<ArrowForward />} sx={{ bgcolor: '#1a1a1a', color: '#fff', borderRadius: '50px', py: 1.6, fontWeight: 600, textTransform: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', '&:hover': { bgcolor: '#333', transform: 'translateY(-1px)' } }}>
                    S'inscrire à cette prestation
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* MODAL INSCRIPTION */}
      <Dialog open={registerOpen} onClose={handleCloseRegister} maxWidth="sm" fullWidth fullScreen={isMobile} PaperProps={{ sx: { borderRadius: isMobile ? 0 : '20px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' } }}>
        <Box sx={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2C2C2C 100%)', color: '#fff', px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.7, letterSpacing: 1.5, fontSize: '0.7rem' }}>Inscription</Typography>
            <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, mt: 0.3 }}>Réserver cette prestation</Typography>
          </Box>
          <IconButton onClick={handleCloseRegister} sx={{ color: '#fff' }}><Close /></IconButton>
        </Box>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Alert severity="info" icon={false} sx={{ mb: 3, borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)', color: '#333' }}>
            Vous vous inscrivez à : <strong>{rubrique.nom}</strong>
          </Alert>
          {formSubmitted ? (
            <Fade in>
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <CheckCircle sx={{ fontSize: 72, color: '#4CAF50', mb: 2 }} />
                <Typography variant="h6" fontWeight={700} color="#1a1a1a" gutterBottom>Inscription réussie !</Typography>
                <Typography variant="body2" color="text.secondary">Vous recevrez un email de confirmation.</Typography>
              </Box>
            </Fade>
          ) : (
            <form onSubmit={handleFormSubmit}>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Nom" name="nom" value={formData.nom} onChange={handleFormChange} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Prénom" name="prenom" value={formData.prenom} onChange={handleFormChange} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleFormChange} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Téléphone" name="telephone" value={formData.telephone} onChange={handleFormChange} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Date souhaitée" name="date" type="date" value={formData.date} onChange={handleFormChange} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Message" name="message" multiline rows={3} value={formData.message} onChange={handleFormChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>
              </Grid>
              <DialogActions sx={{ px: 0, pt: 3.5, pb: 0 }}>
                <Button onClick={handleCloseRegister} sx={{ color: '#666', borderRadius: '50px', px: 3 }}>Annuler</Button>
                <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: '#1a1a1a', color: '#fff', borderRadius: '50px', px: 4, py: 1.2, fontWeight: 600, textTransform: 'none', minWidth: 150, '&:hover': { bgcolor: '#333' } }} startIcon={loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <CheckCircle sx={{ fontSize: 20 }} />}>
                  {loading ? 'Envoi...' : "S'inscrire"}
                </Button>
              </DialogActions>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={5500} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} variant="filled" sx={{ width: '100%', borderRadius: '12px' }}>{snackbarMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

export default RelookingFemmeDetail;