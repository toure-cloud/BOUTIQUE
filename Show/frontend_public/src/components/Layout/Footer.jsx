// src/components/Layout/Footer.jsx
import React from 'react';
import { Box, Container, Typography, Grid, Link, IconButton, Divider } from '@mui/material';
import { Facebook, Instagram, LinkedIn, Twitter, Email, Phone, LocationOn } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        backgroundColor: '#2C2C2C',
        color: '#FFFFFF',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
        <Grid container spacing={4}>
          {/* Colonne 1 - Brand */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
                color: '#FFFFFF',
                mb: 2,
                fontSize: '1.5rem',
              }}
            >
              Madame Tibetia
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#B0B0B0',
                lineHeight: 1.8,
                mb: 2,
              }}
            >
              L'élégance du coaching personnalisé pour une vie de qualité.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                sx={{
                  color: '#B0B0B0',
                  '&:hover': { color: '#FFFFFF' },
                }}
                href="#"
              >
                <Facebook />
              </IconButton>
              <IconButton
                sx={{
                  color: '#B0B0B0',
                  '&:hover': { color: '#FFFFFF' },
                }}
                href="#"
              >
                <Instagram />
              </IconButton>
              <IconButton
                sx={{
                  color: '#B0B0B0',
                  '&:hover': { color: '#FFFFFF' },
                }}
                href="#"
              >
                <LinkedIn />
              </IconButton>
              <IconButton
                sx={{
                  color: '#B0B0B0',
                  '&:hover': { color: '#FFFFFF' },
                }}
                href="#"
              >
                <Twitter />
              </IconButton>
            </Box>
          </Grid>

          {/* Colonne 2 - Liens Rapides */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#FFFFFF',
                mb: 2,
                fontSize: '1rem',
                letterSpacing: 0.5,
              }}
            >
              LIENS RAPIDES
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                href="/"
                sx={{
                  color: '#B0B0B0',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { color: '#FFFFFF' },
                }}
              >
                Accueil
              </Link>
              <Link
                href="/forfaits"
                sx={{
                  color: '#B0B0B0',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { color: '#FFFFFF' },
                }}
              >
                Forfaits
              </Link>
              <Link
                href="/evenements"
                sx={{
                  color: '#B0B0B0',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { color: '#FFFFFF' },
                }}
              >
                Événements
              </Link>
              <Link
                href="/boutique"
                sx={{
                  color: '#B0B0B0',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { color: '#FFFFFF' },
                }}
              >
                Boutique
              </Link>
              <Link
                href="/a-propos"
                sx={{
                  color: '#B0B0B0',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { color: '#FFFFFF' },
                }}
              >
                À Propos
              </Link>
            </Box>
          </Grid>

          {/* Colonne 3 - Services */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#FFFFFF',
                mb: 2,
                fontSize: '1rem',
                letterSpacing: 0.5,
              }}
            >
              NOS SERVICES
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                href="/masterclasses"
                sx={{
                  color: '#B0B0B0',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { color: '#FFFFFF' },
                }}
              >
                Masterclasses
              </Link>
              <Link
                href="/relooking"
                sx={{
                  color: '#B0B0B0',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { color: '#FFFFFF' },
                }}
              >
                Relooking
              </Link>
              <Link
                href="/guides"
                sx={{
                  color: '#B0B0B0',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { color: '#FFFFFF' },
                }}
              >
                Guides
              </Link>
              <Link
                href="/coaching"
                sx={{
                  color: '#B0B0B0',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  '&:hover': { color: '#FFFFFF' },
                }}
              >
                Coaching Personnalisé
              </Link>
            </Box>
          </Grid>

          {/* Colonne 4 - Contact */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#FFFFFF',
                mb: 2,
                fontSize: '1rem',
                letterSpacing: 0.5,
              }}
            >
              CONTACT
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Email sx={{ color: '#A0A0A0', fontSize: 20 }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: '#B0B0B0',
                    fontSize: '0.9rem',
                  }}
                >
                  contact@madametibetia.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Phone sx={{ color: '#A0A0A0', fontSize: 20 }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: '#B0B0B0',
                    fontSize: '0.9rem',
                  }}
                >
                  +33 6 12 34 56 78
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <LocationOn sx={{ color: '#A0A0A0', fontSize: 20, mt: 0.5 }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: '#B0B0B0',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                  }}
                >
                  123 Avenue de l'Élégance
                  <br />
                  75001 Paris, France
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Séparateur */}
        <Divider
          sx={{
            my: 4,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        />

        {/* Copyright - 100% largeur */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#888888',
              fontSize: '0.85rem',
            }}
          >
            © {new Date().getFullYear()} Madame Tibetia. Tous droits réservés.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link
              href="/privacy"
              sx={{
                color: '#888888',
                textDecoration: 'none',
                fontSize: '0.85rem',
                '&:hover': { color: '#FFFFFF' },
              }}
            >
              Politique de confidentialité
            </Link>
            <Link
              href="/terms"
              sx={{
                color: '#888888',
                textDecoration: 'none',
                fontSize: '0.85rem',
                '&:hover': { color: '#FFFFFF' },
              }}
            >
              Conditions d'utilisation
            </Link>
            <Link
              href="/cookies"
              sx={{
                color: '#888888',
                textDecoration: 'none',
                fontSize: '0.85rem',
                '&:hover': { color: '#FFFFFF' },
              }}
            >
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;