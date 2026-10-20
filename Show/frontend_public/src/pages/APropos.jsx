// src/pages/APropos.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Avatar,
  Button,
  alpha,
  Fade,
  Grow,
} from '@mui/material';
import {
  EmojiEvents,
  People,
  School,
  ArrowForward,
} from '@mui/icons-material';

// Image de Madame T
import madameTImage from '../assets/images/tibetia.jpeg';

// ─────────────────────────────────────────────────────────────
// PALETTE PREMIUM
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
};

const APropos = () => {
  const values = [
    {
      icon: <EmojiEvents sx={{ fontSize: 32 }} />,
      title: 'Expertise',
      description:
        'Coaching certifié avec une approche personnalisée et bienveillante, adaptée à chaque parcours unique.',
    },
    {
      icon: <People sx={{ fontSize: 32 }} />,
      title: 'Communauté',
      description:
        'Une communauté grandissante de femmes transformées, solidaires et inspirantes.',
    },
    {
      icon: <School sx={{ fontSize: 32 }} />,
      title: 'Formation Continue',
      description:
        'Des méthodes innovantes, constamment enrichies par les dernières avancées du développement personnel.',
    },
  ];

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh' }}>
      {/* ─── HERO ─────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: T.dark,
          color: '#fff',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            bgcolor: alpha('#fff', 0.03),
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -140,
            left: -100,
            width: 380,
            height: 380,
            borderRadius: '50%',
            bgcolor: alpha('#fff', 0.02),
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 70,
            height: 3,
            bgcolor: T.accent,
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={700}>
            <Box>
              <Typography
                sx={{
                  color: T.accent,
                  letterSpacing: 5,
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  mb: 2,
                }}
              >
                Madame Tibetia
              </Typography>

              <Typography
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 400,
                  fontSize: { xs: '2.6rem', md: '3.8rem' },
                  letterSpacing: -0.8,
                  lineHeight: 1.1,
                  mb: 2.5,
                }}
              >
                À Propos
              </Typography>

              <Typography
                sx={{
                  color: alpha('#fff', 0.75),
                  fontSize: { xs: '1rem', md: '1.15rem' },
                  fontWeight: 300,
                  maxWidth: 520,
                  mx: 'auto',
                  lineHeight: 1.7,
                }}
              >
                L’histoire d’une passion, d’un accompagnement authentique et
                d’une transformation durable.
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* ─── CONTENU PRINCIPAL ────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        {/* Présentation avec photo */}
        <Grow in timeout={600}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              mb: 6,
              borderRadius: 3.5,
              border: `1px solid ${T.border}`,
              bgcolor: T.surface,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Accent vertical doré */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 6,
                height: '100%',
                bgcolor: T.accent,
              }}
            />

            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 3 }} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Avatar
                  src={madameTImage}
                  alt="Madame T"
                  sx={{
                    width: { xs: 140, md: 160 },
                    height: { xs: 140, md: 160 },
                    mx: { xs: 'auto', md: 0 },
                    border: `3px solid ${T.accent}`,
                    boxShadow: `0 12px 32px -8px ${alpha(T.dark, 0.25)}`,
                    // Important pour un beau cadrage portrait
                    '& img': {
                      objectFit: 'cover',
                      objectPosition: 'center 20%',
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 9 }}>
                <Typography
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 600,
                    fontSize: { xs: '1.6rem', md: '1.9rem' },
                    color: T.textPrimary,
                    mb: 1.5,
                    letterSpacing: -0.3,
                  }}
                >
                  Madame T — Votre Coach Professionnelle
                </Typography>

                <Typography
                  sx={{
                    color: T.textSecondary,
                    fontSize: '1.05rem',
                    lineHeight: 1.8,
                    mb: 2,
                  }}
                >
                  Passionnée par le développement personnel et professionnel,
                  Madame T vous accompagne dans votre transformation vers une
                  vie plus épanouie et réussie.
                </Typography>

                <Typography
                  sx={{
                    color: T.textSecondary,
                    fontSize: '1.05rem',
                    lineHeight: 1.8,
                  }}
                >
                  Avec plus de 10 ans d’expérience dans le coaching, elle a
                  aidé des centaines de personnes à atteindre leurs objectifs
                  et à réaliser leur plein potentiel, avec bienveillance,
                  exigence et authenticité.
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grow>

        {/* Valeurs / Piliers */}
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 500,
              fontSize: { xs: '1.7rem', md: '2.1rem' },
              color: T.textPrimary,
              mb: 1,
            }}
          >
            Nos piliers
          </Typography>
          <Typography
            sx={{
              color: T.textMuted,
              fontSize: '0.98rem',
              maxWidth: 480,
              mx: 'auto',
              mb: 5,
            }}
          >
            Trois engagements fondamentaux qui guident chaque accompagnement
          </Typography>
        </Box>

        <Grid container spacing={3.5}>
          {values.map((item, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={item.title}>
              <Grow in timeout={500 + index * 120}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 3,
                    border: `1px solid ${T.border}`,
                    bgcolor: T.surface,
                    textAlign: 'center',
                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 24px 48px -16px ${alpha(T.dark, 0.12)}`,
                      borderColor: alpha(T.accent, 0.4),
                      '& .icon-box': {
                        bgcolor: T.accent,
                        color: T.dark,
                      },
                    },
                  }}
                >
                  <Box
                    className="icon-box"
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      bgcolor: T.accentSoft,
                      color: T.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2.5,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Typography
                    sx={{
                      fontFamily: '"Playfair Display", serif',
                      fontWeight: 600,
                      fontSize: '1.25rem',
                      color: T.textPrimary,
                      mb: 1.5,
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    sx={{
                      color: T.textSecondary,
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                    }}
                  >
                    {item.description}
                  </Typography>
                </Paper>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Chiffres */}
        <Box
          sx={{
            mt: 8,
            py: 5,
            px: { xs: 3, md: 5 },
            borderRadius: 3.5,
            bgcolor: T.dark,
            color: '#fff',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -60,
              right: -40,
              width: 180,
              height: 180,
              borderRadius: '50%',
              bgcolor: alpha(T.accent, 0.08),
            }}
          />

          <Grid container spacing={4}>
            {[
              { value: '10+', label: 'Années d’expérience' },
              { value: '500+', label: 'Personnes accompagnées' },
              { value: '98%', label: 'Satisfaction client' },
            ].map((stat) => (
              <Grid size={{ xs: 12, sm: 4 }} key={stat.label}>
                <Typography
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: { xs: '2.4rem', md: '2.8rem' },
                    fontWeight: 500,
                    color: T.accent,
                    mb: 0.5,
                    letterSpacing: -1,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  sx={{
                    color: alpha('#fff', 0.7),
                    fontSize: '0.95rem',
                    fontWeight: 400,
                  }}
                >
                  {stat.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA final */}
        <Box sx={{ mt: 8, textAlign: 'center', py: 6 }}>
          <Typography
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 500,
              fontSize: { xs: '1.8rem', md: '2.3rem' },
              color: T.textPrimary,
              mb: 1.5,
              letterSpacing: -0.4,
            }}
          >
            Rejoignez l’aventure Show Coaching
          </Typography>

          <Typography
            sx={{
              color: T.textSecondary,
              fontSize: '1.05rem',
              maxWidth: 440,
              mx: 'auto',
              mb: 4,
              lineHeight: 1.7,
            }}
          >
            Commencez votre transformation dès aujourd’hui et révélez la
            meilleure version de vous-même.
          </Typography>

          <Button
            component={Link}
            to="/forfaits"
            variant="contained"
            endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: T.accent,
              color: T.dark,
              borderRadius: 2.5,
              px: 4.5,
              py: 1.6,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              boxShadow: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: T.accentHover,
                boxShadow: `0 16px 32px -10px ${alpha(T.accent, 0.5)}`,
                transform: 'translateY(-3px)',
              },
            }}
          >
            Découvrir les forfaits
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default APropos;