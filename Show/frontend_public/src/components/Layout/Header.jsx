// src/components/Layout/Header.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  alpha,
  Divider,
} from '@mui/material';
import { Menu as MenuIcon, KeyboardArrowDown, Close } from '@mui/icons-material';

// 🎨 Palette (cohérente avec le Footer)
const T = {
  bg: '#FFFFFF',
  textPrimary: '#1F1F1F',
  textSecondary: '#6B6B6B',
  textMuted: '#9A9A9A',
  accent: '#D4AF37',       // doré élégant
  accentSoft: 'rgba(212, 175, 55, 0.12)',
  border: 'rgba(0, 0, 0, 0.06)',
  hoverBg: 'rgba(212, 175, 55, 0.06)',
};

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [relookingAnchor, setRelookingAnchor] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // 📍 URL courante
  const location = useLocation();

  // 🎯 Helper : item actif ?
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navItems = [
    { label: 'Accueil', path: '/' },
    { label: 'Elegance Times online', path: '/elegance-times' },
    { label: 'Événements', path: '/evenements' },
    { label: 'Boutique', path: '/boutique' },
    { label: 'À Propos', path: '/a-propos' },
  ];

  const relookingSubItems = [
    { label: 'Relooking Homme', path: '/relooking/homme' },
    { label: 'Relooking Femme', path: '/relooking/femme' },
    { label: 'Relooking Atelier', path: '/relooking/atelier' },
  ];

  const isRelookingActive = relookingSubItems.some((item) => isActive(item.path));

  const handleRelookingOpen = (event) => setRelookingAnchor(event.currentTarget);
  const handleRelookingClose = () => setRelookingAnchor(null);

  // 🎨 Styles d'un bouton de nav (desktop)
  const navButtonSx = (active) => ({
    color: active ? T.textPrimary : T.textSecondary,
    bgcolor: 'transparent',
    textTransform: 'none',
    fontWeight: active ? 600 : 500,
    fontSize: '0.95rem',
    borderRadius: 1.5,
    px: 1.75,
    py: 1,
    position: 'relative',
    transition: 'all 0.25s ease',
    '&::after': {
      content: '""',
      position: 'absolute',
      left: '50%',
      bottom: 4,
      transform: `translateX(-50%) scaleX(${active ? 1 : 0})`,
      transformOrigin: 'center',
      width: '60%',
      height: '2px',
      bgcolor: T.accent,
      borderRadius: 1,
      transition: 'transform 0.25s ease',
    },
    '&:hover': {
      color: T.textPrimary,
      bgcolor: T.hoverBg,
      '&::after': {
        transform: 'translateX(-50%) scaleX(1)',
      },
    },
  });

  // 🎨 Styles d'un item mobile
  const mobileItemSx = (active, indent = false) => ({
    color: active ? T.textPrimary : T.textSecondary,
    bgcolor: active ? T.accentSoft : 'transparent',
    textTransform: 'none',
    justifyContent: 'flex-start',
    fontWeight: active ? 600 : 500,
    py: 1.2,
    px: 2,
    pl: indent ? 4 : 2,
    borderRadius: 1.5,
    fontSize: indent ? '0.92rem' : '1rem',
    transition: 'all 0.2s ease',
    borderLeft: active ? `3px solid ${T.accent}` : '3px solid transparent',
    '&:hover': {
      color: T.textPrimary,
      bgcolor: T.hoverBg,
    },
  });

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        bgcolor: T.bg,
        borderBottom: `1px solid ${T.border}`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            py: 1.5,
            minHeight: { xs: 64, md: 80 },
          }}
        >
          {/* ─── Logo ───────────────────────────────────── */}
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              textDecoration: 'none',
              color: T.textPrimary,
              fontWeight: 700,
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '1.3rem', md: '1.8rem' },
              letterSpacing: 0.5,
              transition: 'opacity 0.2s',
              '&:hover': { opacity: 0.8 },
            }}
          >
            Madame{' '}
            <Box component="span" sx={{ color: T.accent }}>
              Tibetia
            </Box>
          </Typography>

          {/* ─── Navigation Desktop ─────────────────────── */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  component={Link}
                  to={item.path}
                  sx={navButtonSx(isActive(item.path))}
                >
                  {item.label}
                </Button>
              ))}

              {/* Menu Relooking */}
              <Button
                onClick={handleRelookingOpen}
                endIcon={
                  <KeyboardArrowDown
                    sx={{
                      transition: 'transform 0.25s ease',
                      transform: relookingAnchor ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                }
                sx={navButtonSx(isRelookingActive)}
              >
                Relooking
              </Button>

              <Menu
                anchorEl={relookingAnchor}
                open={Boolean(relookingAnchor)}
                onClose={handleRelookingClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{
                  '& .MuiPaper-root': {
                    borderRadius: 2,
                    boxShadow: '0 12px 40px -8px rgba(0,0,0,0.15)',
                    border: `1px solid ${T.border}`,
                    minWidth: 220,
                    mt: 1.5,
                    py: 1,
                    overflow: 'visible',
                    // Petite flèche décorative
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -6,
                      left: '50%',
                      transform: 'translateX(-50%) rotate(45deg)',
                      width: 12,
                      height: 12,
                      bgcolor: '#FFFFFF',
                      borderTop: `1px solid ${T.border}`,
                      borderLeft: `1px solid ${T.border}`,
                    },
                  },
                }}
              >
                {relookingSubItems.map((item, idx) => {
                  const active = isActive(item.path);
                  return (
                    <React.Fragment key={item.label}>
                      <MenuItem
                        component={Link}
                        to={item.path}
                        onClick={handleRelookingClose}
                        sx={{
                          color: active ? T.textPrimary : T.textSecondary,
                          fontWeight: active ? 600 : 500,
                          fontSize: '0.92rem',
                          py: 1.2,
                          px: 2.5,
                          bgcolor: active ? T.accentSoft : 'transparent',
                          borderLeft: active
                            ? `3px solid ${T.accent}`
                            : '3px solid transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            color: T.textPrimary,
                            bgcolor: T.hoverBg,
                          },
                        }}
                      >
                        {item.label}
                      </MenuItem>
                      {idx < relookingSubItems.length - 1 && (
                        <Divider sx={{ borderColor: T.border, my: 0.5 }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </Menu>
            </Box>
          )}

          {/* ─── Menu Mobile (bouton) ───────────────────── */}
          {isMobile && (
            <IconButton
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="menu"
              sx={{
                color: T.textPrimary,
                border: `1px solid ${T.border}`,
                borderRadius: 1.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: T.hoverBg,
                  borderColor: T.accent,
                },
              }}
            >
              {mobileMenuOpen ? <Close /> : <MenuIcon />}
            </IconButton>
          )}
        </Toolbar>

        {/* ─── Menu Mobile déroulant ────────────────────── */}
        {isMobile && mobileMenuOpen && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              py: 2,
              borderTop: `1px solid ${T.border}`,
              animation: 'fadeIn 0.25s ease',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(-6px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            {navItems.map((item) => (
              <Button
                key={item.label}
                component={Link}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                sx={mobileItemSx(isActive(item.path))}
              >
                {item.label}
              </Button>
            ))}

            {/* Sous-menu Relooking en mobile */}
            <Typography
              sx={{
                color: T.textMuted,
                fontWeight: 700,
                px: 2,
                pt: 2,
                pb: 0.5,
                fontSize: '0.75rem',
                letterSpacing: 1.5,
                textTransform: 'uppercase',
              }}
            >
              Relooking
            </Typography>

            {relookingSubItems.map((item) => (
              <Button
                key={item.label}
                component={Link}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                sx={mobileItemSx(isActive(item.path), true)}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}
      </Container>
    </AppBar>
  );
};

export default Header;