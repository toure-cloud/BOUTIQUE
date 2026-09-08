// frontend_public/src/pages/CommandeSuccess.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Box, Button } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

const CommandeSuccess = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
      <CheckCircle sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        Commande confirmée !
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: '#666' }}>
        Merci pour votre achat. Un SMS de confirmation vous a été envoyé avec les détails de votre commande et la date de livraison.
      </Typography>
      <Button component={Link} to="/boutique" variant="contained" sx={{ px: 4, py: 1.5, borderRadius: '50px' }}>
        Continuer mes achats
      </Button>
    </Container>
  );
};

export default CommandeSuccess;