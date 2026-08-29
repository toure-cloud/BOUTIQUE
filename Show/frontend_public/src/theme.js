// src/theme.js
import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#FADCD9', // Saumon clair
      light: '#FDE8E5',
      dark: '#E8C4C0',
      contrastText: '#4A3728',
    },
    secondary: {
      main: '#D4A5A0', // Saumon moyen
      light: '#E8C4C0',
      dark: '#C08A85',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFF5F3',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#4A3728',
      secondary: '#7A5A4A',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { color: '#4A3728' },
    h2: { color: '#4A3728' },
    h3: { color: '#4A3728' },
    h4: { color: '#4A3728' },
    h5: { color: '#4A3728' },
    h6: { color: '#4A3728' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#FADCD9',
          color: '#4A3728',
          '&:hover': {
            backgroundColor: '#E8C4C0',
          },
        },
        containedSecondary: {
          backgroundColor: '#D4A5A0',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#C08A85',
          },
        },
        outlined: {
          borderColor: '#D4A5A0',
          color: '#4A3728',
          '&:hover': {
            borderColor: '#C08A85',
            backgroundColor: 'rgba(212, 165, 160, 0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FADCD9',
          color: '#4A3728',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(74, 55, 40, 0.1)',
        },
      },
    },
  },
});