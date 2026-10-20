// src/pages/RelookingAtelierDetail.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container, Typography, Box, Grid, Card, CardContent, Button, Chip,
  Divider, Alert, Stack, Avatar, alpha,
} from '@mui/material';
import {
  ArrowBack, CheckCircle, Check, Schedule, WorkspacePremium,
  LocalOffer, ArrowForward, Star, Group,
} from '@mui/icons-material';
import heroImage from '../assets/images/tibetia.jpeg';
import RegisterDialog from '../components/RegisterDialog';
import { useRelookingInscription } from '../hooks/useRelookingInscription';

// ─────────────────────────────────────────────────────────────
const T = {
  bg: '#F8F7F4',
  surface: '#FFFFFF',
  dark: '#1A1A1A',
  darkSoft: '#2C2C2C',
  textPrimary: '#1A1A1A',
  textSecondary: '#5C5C5C',
  textMuted: '#8A8A8A',
  border: '#EAEAEA',
  accent: '#C9A84C',
  accentSoft: 'rgba(201, 168, 76, 0.12)',
  accentHover: '#B8943A',
  success: '#059669',
};

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
              sx={{
                mt: index === 0 ? 0 : 3.5,
                mb: 1.75,
                fontWeight: 600,
                color: T.textPrimary,
                fontFamily: '"Playfair Display", serif',
                fontSize: '1.15rem',
              }}
            >
              {trimmed.replace('## ', '')}
            </Typography>
          );
        }

        if (trimmed.startsWith('• ')) {
          return (
            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 0.6 }}>
              <Box sx={{ mt: 0.9, width: 6, height: 6, borderRadius: '50%', bgcolor: T.accent, flexShrink: 0 }} />
              <Typography sx={{ color: T.textSecondary, lineHeight: 1.7, fontSize: '0.95rem' }}>
                {trimmed.replace('• ', '')}
              </Typography>
            </Box>
          );
        }

        if (trimmed.startsWith('- ')) {
          return (
            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, pl: 1.5, py: 0.35 }}>
              <Check sx={{ fontSize: 16, color: T.success, mt: 0.35, flexShrink: 0 }} />
              <Typography sx={{ color: T.textSecondary, lineHeight: 1.65, fontSize: '0.92rem' }}>
                {trimmed.replace('- ', '')}
              </Typography>
            </Box>
          );
        }

        if (/^(Matinée|Après-midi|Jour\s+\d+)/i.test(trimmed)) {
          return (
            <Box key={index} sx={{ mt: 3, mb: 1, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Schedule sx={{ fontSize: 18, color: T.accent }} />
              <Typography sx={{ fontWeight: 600, color: T.textPrimary, fontSize: '1rem' }}>
                {trimmed}
              </Typography>
            </Box>
          );
        }

        return (
          <Typography key={index} sx={{ color: T.textSecondary, lineHeight: 1.8, mb: 1.5, fontSize: '0.95rem' }}>
            {trimmed}
          </Typography>
        );
      })}
    </Box>
  );
};

const RelookingAtelierDetail = () => {
  const { id } = useParams();
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
      <Container sx={{ py: 12, textAlign: 'center' }}>
        <Alert severity="error" sx={{ borderRadius: 2.5, mb: 3, maxWidth: 480, mx: 'auto' }}>
          Atelier non trouvé
        </Alert>
        <Button
          component={Link}
          to="/relooking/atelier"
          startIcon={<ArrowBack />}
          variant="outlined"
          sx={{ borderRadius: 50, borderColor: T.border, color: T.textPrimary }}
        >
          Retour aux ateliers
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh' }}>
      {/* HERO */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 240, md: 320 },
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
          bgcolor: T.dark,
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
            opacity: 0.35,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, ${alpha(T.dark, 0.35)} 0%, ${alpha(T.dark, 0.88)} 100%)`,
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pb: { xs: 3.5, md: 4.5 } }}>
          <Chip
            label="ATELIER RELOOKING"
            size="small"
            sx={{
              mb: 1.75,
              bgcolor: alpha('#fff', 0.12),
              color: '#fff',
              fontWeight: 600,
              letterSpacing: 1.5,
              fontSize: '0.68rem',
              height: 26,
              borderRadius: 1.5,
            }}
          />
          <Typography
            sx={{
              fontWeight: 500,
              color: '#fff',
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '1.85rem', md: '2.85rem' },
              mb: 2.25,
              letterSpacing: -0.5,
              lineHeight: 1.15,
            }}
          >
            {rubrique.nom}
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<Star sx={{ color: `${T.accent} !important`, fontSize: 15 }} />}
              label={`${rubrique.note} · ${rubrique.nb_avis} avis`}
              sx={{
                bgcolor: alpha('#fff', 0.95),
                fontWeight: 600,
                borderRadius: 1.5,
                height: 28,
              }}
            />
            <Chip
              icon={<Group sx={{ fontSize: 15, color: '#fff !important' }} />}
              label={rubrique.participants}
              sx={{
                bgcolor: alpha('#fff', 0.15),
                color: '#fff',
                fontWeight: 600,
                borderRadius: 1.5,
                height: 28,
              }}
            />
            <Chip
              label={rubrique.categorie}
              sx={{
                bgcolor: alpha('#fff', 0.15),
                color: '#fff',
                fontWeight: 600,
                borderRadius: 1.5,
                height: 28,
              }}
            />
          </Stack>
        </Container>
      </Box>

      {/* CONTENU */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {pageMessage && (
          <Alert
            severity={pageMessage.type}
            onClose={dismissPageMessage}
            sx={{
              mb: 3.5,
              borderRadius: 2.5,
              boxShadow: `0 4px 20px ${alpha(T.dark, 0.06)}`,
            }}
          >
            <Typography sx={{ fontWeight: 700 }}>{pageMessage.title}</Typography>
            <Typography variant="body2">{pageMessage.text}</Typography>
          </Alert>
        )}

        <Button
          component={Link}
          to="/relooking/atelier"
          startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
          sx={{
            mb: 4,
            color: T.textMuted,
            textTransform: 'none',
            fontWeight: 500,
            px: 0,
            '&:hover': { color: T.textPrimary, bgcolor: 'transparent' },
          }}
        >
          Retour aux ateliers
        </Button>

        <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3.5}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${T.border}`,
                  bgcolor: T.surface,
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      mb: 2.75,
                      fontFamily: '"Playfair Display", serif',
                      color: T.textPrimary,
                      fontSize: '1.25rem',
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
                  borderRadius: 3,
                  border: `1px solid ${T.border}`,
                  bgcolor: T.surface,
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      mb: 2.75,
                      fontFamily: '"Playfair Display", serif',
                      color: T.textPrimary,
                      fontSize: '1.25rem',
                    }}
                  >
                    Ce que vous allez apprendre
                  </Typography>
                  <Stack spacing={1.75}>
                    {rubrique.youWillLearn.map((point, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75 }}>
                        <Avatar
                          sx={{
                            width: 30,
                            height: 30,
                            bgcolor: alpha(T.success, 0.12),
                            color: T.success,
                          }}
                        >
                          <CheckCircle sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography sx={{ color: T.textSecondary, pt: 0.4, fontSize: '0.95rem', lineHeight: 1.5 }}>
                          {point}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${T.border}`,
                  overflow: 'hidden',
                  boxShadow: `0 16px 48px -12px ${alpha(T.dark, 0.1)}`,
                }}
              >
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${T.dark} 0%, ${T.darkSoft} 100%)`,
                    px: 3.5,
                    py: 2.75,
                    color: '#fff',
                  }}
                >
                  <Typography
                    sx={{
                      opacity: 0.65,
                      letterSpacing: 1.8,
                      fontSize: '0.68rem',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                    }}
                  >
                    Résumé de l'atelier
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontFamily: '"Playfair Display", serif',
                      mt: 0.75,
                      fontSize: '1.3rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {rubrique.nom}
                  </Typography>
                </Box>

                <CardContent sx={{ p: 3.5 }}>
                  <Stack spacing={2.75} sx={{ mb: 3.5 }}>
                    {[
                      { icon: <LocalOffer sx={{ fontSize: 20 }} />, label: 'Prix', value: rubrique.prix },
                      { icon: <Schedule sx={{ fontSize: 20 }} />, label: 'Durée', value: rubrique.duree },
                      { icon: <Group sx={{ fontSize: 20 }} />, label: 'Participants', value: rubrique.participants },
                      { icon: <WorkspacePremium sx={{ fontSize: 20 }} />, label: 'Note', value: `${rubrique.note}/5 (${rubrique.nb_avis} avis)` },
                    ].map((item) => (
                      <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: T.accentSoft,
                            color: T.accent,
                            width: 44,
                            height: 44,
                          }}
                        >
                          {item.icon}
                        </Avatar>
                        <Box>
                          <Typography sx={{ color: T.textMuted, fontSize: '0.75rem', fontWeight: 500 }}>
                            {item.label}
                          </Typography>
                          <Typography sx={{ fontWeight: 600, color: T.textPrimary, fontSize: '1.05rem' }}>
                            {item.value}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>

                  <Divider sx={{ mb: 2.75, borderColor: T.border }} />

                  <Typography sx={{ fontWeight: 600, mb: 1.75, color: T.textPrimary, fontSize: '0.95rem' }}>
                    Avantages inclus
                  </Typography>
                  <Stack spacing={1.1} sx={{ mb: 3.5 }}>
                    {rubrique.avantages.map((avantage, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Check sx={{ fontSize: 17, color: T.success }} />
                        <Typography sx={{ color: T.textSecondary, fontSize: '0.9rem' }}>
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
                    endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
                    sx={{
                      bgcolor: T.dark,
                      color: '#fff',
                      borderRadius: 2.5,
                      py: 1.7,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      boxShadow: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: T.accent,
                        color: T.dark,
                        boxShadow: `0 12px 32px ${alpha(T.accent, 0.35)}`,
                        transform: 'translateY(-2px)',
                      },
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