// src/theme.js
import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2C2C2C',
      light: '#4A4A4A',
      dark: '#1A1A1A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#9E9E9E',
      light: '#BDBDBD',
      dark: '#757575',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8F8F8',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C2C2C',
      secondary: '#666666',
      disabled: '#BDBDBD',
    },
    divider: '#EEEEEE',
    success: { main: '#66BB6A', light: '#A5D6A7', dark: '#388E3C' },
    warning: { main: '#FFA726', light: '#FFCC80', dark: '#F57C00' },
    error: { main: '#EF5350', light: '#EF9A9A', dark: '#C62828' },
    info: { main: '#42A5F5', light: '#90CAF9', dark: '#1565C0' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Inter", sans-serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontFamily: '"Inter", sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Inter", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Inter", sans-serif', fontWeight: 500 },
    h6: { fontFamily: '"Inter", sans-serif', fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.04)',
    '0 4px 12px rgba(0,0,0,0.04)',
    '0 8px 24px rgba(0,0,0,0.06)',
    '0 12px 40px rgba(0,0,0,0.06)',
    '0 16px 48px rgba(0,0,0,0.06)',
    '0 20px 56px rgba(0,0,0,0.08)',
    '0 24px 64px rgba(0,0,0,0.08)',
    '0 28px 72px rgba(0,0,0,0.08)',
    '0 32px 80px rgba(0,0,0,0.08)',
    '0 36px 88px rgba(0,0,0,0.08)',
    '0 40px 96px rgba(0,0,0,0.08)',
    '0 44px 104px rgba(0,0,0,0.08)',
    '0 48px 112px rgba(0,0,0,0.08)',
    '0 52px 120px rgba(0,0,0,0.08)',
    '0 56px 128px rgba(0,0,0,0.08)',
    '0 60px 136px rgba(0,0,0,0.08)',
    '0 64px 144px rgba(0,0,0,0.08)',
    '0 68px 152px rgba(0,0,0,0.08)',
    '0 72px 160px rgba(0,0,0,0.08)',
    '0 76px 168px rgba(0,0,0,0.08)',
    '0 80px 176px rgba(0,0,0,0.08)',
    '0 84px 184px rgba(0,0,0,0.08)',
    '0 88px 192px rgba(0,0,0,0.08)',
    '0 92px 200px rgba(0,0,0,0.08)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: '8px', fontWeight: 500, padding: '8px 20px' },
        contained: {
          backgroundColor: '#2C2C2C',
          color: '#FFFFFF',
          boxShadow: 'none',
          '&:hover': { backgroundColor: '#1A1A1A', boxShadow: 'none' },
          '&:disabled': { backgroundColor: '#EEEEEE', color: '#BDBDBD' },
        },
        outlined: {
          borderColor: '#E0E0E0',
          color: '#2C2C2C',
          '&:hover': { borderColor: '#BDBDBD', backgroundColor: 'rgba(0,0,0,0.02)' },
        },
        text: { color: '#2C2C2C', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid #F0F0F0',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.04)' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
        elevation1: { boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
        elevation2: { boxShadow: '0 4px 12px rgba(0,0,0,0.04)' },
        elevation3: { boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: '#FFFFFF', color: '#2C2C2C', boxShadow: 'none', borderBottom: '1px solid #F0F0F0' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: '#FFFFFF', color: '#2C2C2C', borderRight: '1px solid #F0F0F0' },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: { borderRadius: '8px', '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' } },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: { color: '#9E9E9E', minWidth: '36px' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: '6px', fontWeight: 500 },
        sizeSmall: { fontSize: '0.7rem', height: '24px' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#BDBDBD' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2C2C2C', borderWidth: '1.5px' },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: { borderColor: '#E0E0E0' },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#F0F0F0' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: '8px' },
        standardSuccess: { backgroundColor: '#E8F5E9', color: '#2E7D32' },
        standardError: { backgroundColor: '#FFEBEE', color: '#C62828' },
        standardWarning: { backgroundColor: '#FFF3E0', color: '#E65100' },
        standardInfo: { backgroundColor: '#E3F2FD', color: '#0D47A1' },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: { fontWeight: 600 },
      },
    },
  },
});

export default theme;