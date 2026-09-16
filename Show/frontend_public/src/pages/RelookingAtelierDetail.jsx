// src/pages/RelookingAtelierDetail.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container, Typography, Box, Grid, Card, CardContent, Button, Chip,
  Divider, Alert, useTheme, useMediaQuery, Stack, Avatar,
} from '@mui/material';
import {
  ArrowBack, CheckCircle, Check, Schedule, WorkspacePremium,
  LocalOffer, ArrowForward, Star, Group,
} from '@mui/icons-material';
import heroImage from '../assets/images/tibetia.jpeg';
import RegisterDialog from '../components/RegisterDialog';
import { useRelookingInscription } from '../hooks/useRelookingInscription';

// ============================================================
// DONNÉES
// ============================================================
const RUBRIQUES = {
  1: {
    id: 1,
    nom: 'Atelier Style et Élégance',
    categorie: 'Style',
    description: "Un atelier collectif pour maîtriser les codes de l'élégance au quotidien.",
    description_detail: `
Un atelier collectif pour apprendre les codes de l'élégance.

## Ce que comprend cette prestation

• Les fondamentaux du style élégant
• Comment choisir les bonnes couleurs
• Les associations de vêtements réussies
• Les accessoires qui font la différence
• La posture et la présence

## Programme détaillé

Matinée (3h)
- Les fondamentaux du style
- Analyse des silhouettes
- Choix des couleurs

Après-midi (3h)
- Ateliers pratiques
- Mises en situation
- Conseils personnalisés
    `,
    prix: '75 000 CFA',
    duree: '1 journée',
    participants: '2 - 6 personnes',
    note: 4.8,
    nb_avis: 34,
    youWillLearn: [
      "Maîtriser les codes de l'élégance",
      'Choisir les bonnes couleurs',
      'Réussir vos associations vestimentaires',
      'Utiliser les accessoires à bon escient',
      'Adopter une posture élégante',
    ],
    avantages: [
      'Atelier en petit groupe',
      'Exercices pratiques',
      'Fiches mémo',
      'Suivi post-atelier',
    ],
  },
  2: {
    id: 2,
    nom: 'Atelier Relooking de Groupe',
    categorie: 'Groupe',
    description: 'Un atelier en petit groupe pour une transformation collective.',
    description_detail: `
Une transformation collective pour révéler votre style.

## Ce que comprend cette prestation

• Analyse collective des styles
• Conseils personnalisés
• Shopping en groupe
• Défilé de mode
• Photos professionnelles

## Programme détaillé

Jour 1 (6h)
- Analyse des styles individuels
- Conseils personnalisés
- Shopping en groupe

Jour 2 (6h)
- Restyling complet
- Défilé de mode
- Photos professionnelles
    `,
    prix: '120 000 CFA',
    duree: '2 jours',
    participants: '2 - 6 personnes',
    note: 4.9,
    nb_avis: 28,
    youWillLearn: [
      'Analyser votre style personnel',
      'Bénéficier de conseils personnalisés',
      'Faire du shopping en groupe',
      'Participer à un défilé de mode',
      'Repartir avec des photos pro',
    ],
    avantages: [
      'Transformation collective',
      'Photos professionnelles',
      'Shopping guidé',
      'Ambiance conviviale',
    ],
  },
  3: {
    id: 3,
    nom: 'Masterclass Image et Confiance',
    categorie: 'Masterclass',
    description: 'Une masterclass intensive pour révéler votre charisme et votre image.',
    description_detail: `
Une masterclass intensive pour transformer votre image et votre confiance.

## Ce que comprend cette prestation

• Psychologie de l'image
• Communication non verbale
• Style et élégance
• Prise de parole
• Développement personnel

## Programme détaillé

Jour 1 (7h)
- Psychologie de l'image
- Communication non verbale

Jour 2 (7h)
- Style et élégance
- Prise de parole en public

Jour 3 (7h)
- Développement personnel
- Mises en situation
    `,
    prix: '180 000 CFA',
    duree: '3 jours',
    participants: '2 - 6 personnes',
    note: 5.0,
    nb_avis: 19,
    youWillLearn: [
      "Comprendre la psychologie de l'image",
      'Maîtriser la communication non verbale',
      'Développer votre style personnel',
      'Prendre la parole avec confiance',
      'Travailler votre développement personnel',
    ],
    avantages: [
      'Masterclass intensive',
      'Accompagnement premium',
      'Supports exclusifs',
      'Suivi personnalisé',
    ],
  },
};

// ============================================================
// RENDU DESCRIPTION
// ============================================================
const RichDescription = ({ content }) => {
  const lines = content?.split('\n') || [];
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
              <Box sx={{ mt: 0.8, width: 6, height: 6, borderRadius: '50%', bgcolor: '#2C2C2C', flexShrink: 0 }} />
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

        if (/^(Matinée|Après-midi|Jour\s+\d+)/i.test(trimmed)) {
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
const RelookingAtelierDetail = () => {
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const rubrique = RUBRIQUES[id];

  const {
    open, formData, loading, submitted, message,
    pageMessage,
    handleOpen, handleClose, handleFormChange, handleSubmit, clearMessage,
    dismissPageMessage,
  } = useRelookingInscription({
    type: 'ATELIER',
    rubrique: rubrique || {},
    withNbPersonnes: true,
  });

  if (!rubrique) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <Alert severity="error" sx={{ borderRadius: 3, mb: 3, maxWidth: 480, mx: 'auto' }}>
          Atelier non trouvé
        </Alert>
        <Button
          component={Link}
          to="/relooking/atelier"
          startIcon={<ArrowBack />}
          variant="outlined"
          sx={{ borderRadius: 50 }}
        >
          Retour aux ateliers
        </Button>
      </Container>
    );
  }

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
            label="ATELIER RELOOKING"
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
            <Chip
              icon={<Group sx={{ fontSize: 16, color: '#fff !important' }} />}
              label={rubrique.participants}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600 }}
            />
            <Chip
              label={rubrique.categorie}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600 }}
            />
          </Stack>
        </Container>
      </Box>

      {/* CONTENU */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {/* ✅ Message de succès persistant après fermeture du dialog */}
        {pageMessage && (
          <Alert
            severity={pageMessage.type}
            onClose={dismissPageMessage}
            sx={{
              mb: 3,
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {pageMessage.title}
            </Typography>
            <Typography variant="body2">{pageMessage.text}</Typography>
          </Alert>
        )}

        <Button
          component={Link}
          to="/relooking/atelier"
          startIcon={<ArrowBack />}
          sx={{ mb: 4, color: '#666' }}
        >
          Retour aux ateliers
        </Button>

        <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
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
                    Description détaillée
                  </Typography>
                  <RichDescription content={rubrique.description_detail} />
                </CardContent>
              </Card>

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
                    Résumé de l'atelier
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
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Prix
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="#1a1a1a">
                          {rubrique.prix}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.06)', color: '#1a1a1a', width: 42, height: 42 }}>
                        <Schedule sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Durée
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="#1a1a1a">
                          {rubrique.duree}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.06)', color: '#1a1a1a', width: 42, height: 42 }}>
                        <Group sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Participants
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="#1a1a1a">
                          {rubrique.participants}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.06)', color: '#1a1a1a', width: 42, height: 42 }}>
                        <WorkspacePremium sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
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
                    onClick={handleOpen}
                    endIcon={<ArrowForward />}
                    sx={{
                      bgcolor: '#1a1a1a',
                      color: '#fff',
                      borderRadius: '50px',
                      py: 1.6,
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                      '&:hover': { bgcolor: '#333', transform: 'translateY(-1px)' },
                    }}
                  >
                    Réserver cet atelier
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* DIALOG D'INSCRIPTION */}
      <RegisterDialog
        open={open}
        onClose={handleClose}
        prestationNom={rubrique.nom}
        formData={formData}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        loading={loading}
        submitted={submitted}
        message={message}
        onClearMessage={clearMessage}
        submitLabel="Réserver"
        showNbPersonnes
      />
    </Box>
  );
};

export default RelookingAtelierDetail;