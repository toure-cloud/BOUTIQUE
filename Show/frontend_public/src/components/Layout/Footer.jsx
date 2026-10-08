// src/components/Layout/Footer.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  Divider,
  Stack,
  alpha,
} from '@mui/material';
import {
  Facebook,
  Instagram,
  LinkedIn,
  Twitter,
  Email,
  Phone,
  LocationOn,
  ArrowForward,
} from '@mui/icons-material';

// 🎨 Palette
const T = {
  bg: '#1F1F1F',
  bgGradient: 'linear-gradient(180deg, #262626 0%, #1A1A1A 100%)',
  surface: 'rgba(255, 255, 255, 0.03)',
  border: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textMuted: '#888888',
  accent: '#D4AF37',       // doré élégant
  accentSoft: 'rgba(212, 175, 55, 0.15)',
};

const Footer = () => {
  // 🔗 Liens rapides
  const quickLinks = [
    { label: 'Accueil', to: '/' },
    { label: 'Elegance Times', to: '/elegance-times' },
    { label: 'Événements', to: '/evenements' },
    { label: 'Boutique', to: '/boutique' },
    { label: 'À Propos', to: '/a-propos' },
  ];

  // 📱 Réseaux sociaux
  const socials = [
    { icon: <Facebook />, href: '#', label: 'Facebook' },
    { icon: <Instagram />, href: '#', label: 'Instagram' },
    { icon: <LinkedIn />, href: '#', label: 'LinkedIn' },
    { icon: <Twitter />, href: '#', label: 'Twitter' },
  ];

  // ⚖️ Légal
  const legalLinks = [
    { label: 'Politique de confidentialité', to: '/privacy' },
    { label: 'Conditions d\'utilisation', to: '/terms' },
    { label: 'Cookies', to: '/cookies' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        background: T.bgGradient,
        color: T.textPrimary,
        pt: 7,
        pb: 4,
        mt: 'auto',
        borderTop: `1px solid ${T.border}`,
        position: 'relative',
        // Liseré doré en haut
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent 0%, ${T.accent} 50%, transparent 100%)`,
        },
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 4, md: 6 } }}>
        <Grid container spacing={{ xs: 4, md: 6 }}>
          {/* ─── Colonne 1 : Brand ─────────────────────── */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
                color: T.textPrimary,
                fontSize: { xs: '1.6rem', md: '2rem' },
                letterSpacing: 0.5,
                mb: 1.5,
              }}
            >
              Madame{' '}
              <Box component="span" sx={{ color: T.accent }}>
                Tibetia
              </Box>
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: T.textSecondary,
                lineHeight: 1.9,
                mb: 3,
                maxWidth: 380,
                fontSize: '0.92rem',
              }}
            >
              L'élégance du coaching personnalisé pour une vie de qualité.
              Découvrez un univers où le raffinement rencontre l'excellence.
            </Typography>

            {/* Réseaux sociaux */}
            <Stack direction="row" spacing={1.2}>
              {socials.map((s) => (
                <IconButton
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  sx={{
                    color: T.textSecondary,
                    border: `1px solid ${T.border}`,
                    bgcolor: T.surface,
                    width: 42,
                    height: 42,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      color: T.bg,
                      bgcolor: T.accent,
                      borderColor: T.accent,
                      transform: 'translateY(-3px)',
                      boxShadow: `0 8px 20px -6px ${alpha(T.accent, 0.5)}`,
                    },
                  }}
                >
                  {s.icon}
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* ─── Colonne 2 : Liens Rapides ────────────── */}
          <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
            <Typography
              sx={{
                fontWeight: 700,
                color: T.textPrimary,
                mb: 2.5,
                fontSize: '0.85rem',
                letterSpacing: 2,
                textTransform: 'uppercase',
                position: 'relative',
                display: 'inline-block',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  bottom: -8,
                  width: 28,
                  height: 2,
                  bgcolor: T.accent,
                  borderRadius: 1,
                },
              }}
            >
              Liens rapides
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.3, mt: 1 }}>
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  component={RouterLink}
                  to={link.to}
                  underline="none"
                  sx={{
                    color: T.textSecondary,
                    fontSize: '0.92rem',
                    width: 'fit-content',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: -14,
                      top: '50%',
                      transform: 'translateY(-50%) scaleX(0)',
                      transformOrigin: 'left',
                      width: 8,
                      height: 1,
                      bgcolor: T.accent,
                      transition: 'transform 0.25s ease',
                    },
                    '&:hover': {
                      color: T.accent,
                      transform: 'translateX(6px)',
                      '&::before': {
                        transform: 'translateY(-50%) scaleX(1)',
                      },
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* ─── Colonne 3 : Contact ──────────────────── */}
          <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
            <Typography
              sx={{
                fontWeight: 700,
                color: T.textPrimary,
                mb: 2.5,
                fontSize: '0.85rem',
                letterSpacing: 2,
                textTransform: 'uppercase',
                position: 'relative',
                display: 'inline-block',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  bottom: -8,
                  width: 28,
                  height: 2,
                  bgcolor: T.accent,
                  borderRadius: 1,
                },
              }}
            >
              Contact
            </Typography>

            <Stack spacing={2} sx={{ mt: 1 }}>
              {/* Email */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: T.accentSoft,
                    color: T.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Email sx={{ fontSize: 18 }} />
                </Box>
                <Typography
                  component="a"
                  href="mailto:contact@madametibetia.com"
                  sx={{
                    color: T.textSecondary,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    '&:hover': { color: T.accent },
                  }}
                >
                  contact@madametibetia.com
                </Typography>
              </Box>

              {/* Téléphone */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: T.accentSoft,
                    color: T.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Phone sx={{ fontSize: 18 }} />
                </Box>
                <Typography
                  component="a"
                  href="tel:+2250707070707"
                  sx={{
                    color: T.textSecondary,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    '&:hover': { color: T.accent },
                  }}
                >
                  +225 07 07 07 07 07
                </Typography>
              </Box>

              {/* Adresse */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: T.accentSoft,
                    color: T.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <LocationOn sx={{ fontSize: 18 }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: T.textSecondary,
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                    pt: 0.5,
                  }}
                >
                  Boulevard Latrille,
                  <br />
                  Cocody 2 Plateaux, Abidjan
                  <br />
                  Côte d'Ivoire
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* ─── Séparateur ──────────────────────────────── */}
        <Divider
          sx={{
            my: 5,
            borderColor: T.border,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -1,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 60,
              height: 2,
              bgcolor: T.accent,
              borderRadius: 1,
            },
          }}
        />

        {/* ─── Bas de page ─────────────────────────────── */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'center' },
            gap: 2,
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: T.textMuted,
              fontSize: '0.82rem',
              letterSpacing: 0.3,
            }}
          >
            © {new Date().getFullYear()}{' '}
            <Box component="span" sx={{ color: T.textSecondary, fontWeight: 600 }}>
              Madame Tibetia
            </Box>
            . Tous droits réservés.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: { xs: 2, sm: 3 },
            }}
          >
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                component={RouterLink}
                to={link.to}
                underline="none"
                sx={{
                  color: T.textMuted,
                  fontSize: '0.82rem',
                  transition: 'color 0.2s',
                  '&:hover': { color: T.accent },
                }}
              >
                {link.label}
              </Link>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;