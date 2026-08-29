// src/components/Layout/Header.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
} from '@mui/material';
import { Menu as MenuIcon, KeyboardArrowDown } from '@mui/icons-material';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [relookingAnchor, setRelookingAnchor] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const handleRelookingOpen = (event) => {
    setRelookingAnchor(event.currentTarget);
  };

  const handleRelookingClose = () => {
    setRelookingAnchor(null);
  };

  return (
    <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: '#FFFFFF' }}>
      <Container maxWidth="xl">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
          {/* Logo */}
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              textDecoration: 'none',
              color: '#2C2C2C',
              fontWeight: 700,
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '1.2rem', md: '1.8rem' },
              letterSpacing: 0.5,
            }}
          >
            Madame <strong style={{ color: '#A0A0A0' }}>Tibetia</strong>
          </Typography>

          {/* Navigation Desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: '#666666',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    '&:hover': {
                      color: '#2C2C2C',
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}

              {/* Menu Relooking avec sous-menu */}
              <Button
                onClick={handleRelookingOpen}
                sx={{
                  color: '#666666',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  '&:hover': {
                    color: '#2C2C2C',
                    backgroundColor: 'transparent',
                  },
                }}
                endIcon={<KeyboardArrowDown />}
              >
                Relooking
              </Button>
              <Menu
                anchorEl={relookingAnchor}
                open={Boolean(relookingAnchor)}
                onClose={handleRelookingClose}
                sx={{
                  '& .MuiPaper-root': {
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                    minWidth: '200px',
                    mt: 1,
                  },
                }}
              >
                {relookingSubItems.map((item) => (
                  <MenuItem
                    key={item.label}
                    component={Link}
                    to={item.path}
                    onClick={handleRelookingClose}
                    sx={{
                      color: '#666666',
                      '&:hover': {
                        color: '#2C2C2C',
                        backgroundColor: '#F5F5F5',
                      },
                    }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}

          {/* Menu Mobile */}
          {isMobile && (
            <IconButton
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              sx={{ color: '#2C2C2C' }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>

        {/* Menu Mobile déroulant */}
        {isMobile && mobileMenuOpen && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              py: 2,
              borderTop: '1px solid rgba(0, 0, 0, 0.05)',
            }}
          >
            {navItems.map((item) => (
              <Button
                key={item.label}
                component={Link}
                to={item.path}
                sx={{
                  color: '#666666',
                  textTransform: 'none',
                  justifyContent: 'flex-start',
                  py: 1,
                  fontSize: '1rem',
                  '&:hover': {
                    color: '#2C2C2C',
                    backgroundColor: 'transparent',
                  },
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Button>
            ))}
            
            {/* Sous-menu Relooking en mobile */}
            <Typography
              sx={{
                color: '#2C2C2C',
                fontWeight: 600,
                px: 2,
                py: 1,
                fontSize: '0.9rem',
                mt: 1,
              }}
            >
              Relooking
            </Typography>
            {relookingSubItems.map((item) => (
              <Button
                key={item.label}
                component={Link}
                to={item.path}
                sx={{
                  color: '#666666',
                  textTransform: 'none',
                  justifyContent: 'flex-start',
                  py: 0.5,
                  pl: 4,
                  fontSize: '0.9rem',
                  '&:hover': {
                    color: '#2C2C2C',
                    backgroundColor: 'transparent',
                  },
                }}
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
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