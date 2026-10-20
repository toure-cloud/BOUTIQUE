// src/pages/RelookingHommeDetail.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container, Typography, Box, Grid, Card, CardContent, Button, Chip,
  Divider, Alert, Stack, Avatar, alpha,
} from '@mui/material';
import {
  ArrowBack, CheckCircle, Check, Schedule, WorkspacePremium,
  LocalOffer, ArrowForward, Star, AccessTime,
} from '@mui/icons-material';
import heroImage from '../assets/images/tibetia.jpeg';
import RegisterDialog from '../components/RegisterDialog';
import { useRelookingInscription } from '../hooks/useRelookingInscription';

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
      "Maîtriser l'art des associations de couleurs",
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
      "Guide d'entretien",
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
      "Conseils sur les accessoires d'époque",
      'Shopping dans des boutiques sélectionnées',
      "Création d'une garde-robe vintage moderne",
    ],
    avantages: [
      'Lookbook personnalisé',
      'Guide des marques vintage',
      "Conseils d'entretien",
      'Pièces uniques',
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

        if (/^Séance\s+\d+/i.test(trimmed)) {
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

const RelookingHommeDetail = () => {
  const { id } = useParams();
  const rubrique = RUBRIQUES[id];

  const {
    open, formData, loading, submitted, message,
    pageMessage,
    handleOpen, handleClose, handleFormChange, handleSubmit, clearMessage,
    dismissPageMessage,
  } = useRelookingInscription({
    type: 'HOMME',
    rubrique: rubrique || {},
    withNbPersonnes: false,
  });

  if (!rubrique) {
    return (
      <Container sx={{ py: 12, textAlign: 'center' }}>
        <Alert severity="error" sx={{ borderRadius: 2.5, mb: 3, maxWidth: 480, mx: 'auto' }}>
          Rubrique non trouvée
        </Alert>
        <Button
          component={Link}
          to="/relooking/homme"
          startIcon={<ArrowBack />}
          variant="outlined"
          sx={{ borderRadius: 50, borderColor: T.border, color: T.textPrimary }}
        >
          Retour aux rubriques
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
            label="RELOOKING HOMME"
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
          to="/relooking/homme"
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
          Retour aux rubriques
        </Button>

        <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3.5}>
              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${T.border}`, bgcolor: T.surface }}>
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

              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${T.border}`, bgcolor: T.surface }}>
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
                    Résumé de la prestation
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
                      { icon: <AccessTime sx={{ fontSize: 20 }} />, label: 'Durée', value: rubrique.duree },
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
                    S'inscrire à cette prestation
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
        submitLabel="S'inscrire"
      />
    </Box>
  );
};

export default RelookingHommeDetail;