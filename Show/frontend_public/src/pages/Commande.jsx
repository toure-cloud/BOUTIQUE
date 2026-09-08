// frontend_public/src/pages/Commande.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper, Alert } from '@mui/material';
import { ArrowBack, CheckCircle } from '@mui/icons-material';
import { panierService } from '../services/panierService';

const Commande = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [panier, setPanier] = useState(null);
  const [commandeOk, setCommandeOk] = useState(false);

  useEffect(() => {
    const storedClient = localStorage.getItem('client_data');
    if (storedClient) {
      setClient(JSON.parse(storedClient));
    }
  }, []);

  useEffect(() => {
    if (client) {
      fetchPanier();
    }
  }, [client]);

  const fetchPanier = async () => {
    try {
      const data = await panierService.getPanier(client.id);
      setPanier(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmerCommande = async () => {
    // Logique pour valider la commande (envoyer au backend)
    setCommandeOk(true);
  };

  const formatPrice = (price) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price);

  if (!client) {
    return (
      <Container maxWidth="lg" sx={{ py: 10, textAlign: 'center' }}>
        <Alert severity="warning">Veuillez vous connecter pour passer une commande.</Alert>
        <Button component={Link} to="/login" variant="contained" sx={{ mt: 3 }}>Se connecter</Button>
      </Container>
    );
  }

  if (commandeOk) {
    return (
      <Container maxWidth="lg" sx={{ py: 10, textAlign: 'center' }}>
        <CheckCircle sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Commande confirmée !</Typography>
        <Typography sx={{ mb: 3 }}>Merci pour votre achat. Vous recevrez un SMS de confirmation.</Typography>
        <Button component={Link} to="/boutique" variant="contained">Continuer mes achats</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/panier')} sx={{ mb: 3, textTransform: 'none' }}>
        Retour au panier
      </Button>
      
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Passer commande</Typography>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Récapitulatif de la commande</Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Client :</strong> {client.prenom} {client.nom}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Total :</strong> {formatPrice(panier?.total || 0)}
        </Typography>
        
        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleConfirmerCommande}
            sx={{ px: 4, py: 1.5, borderRadius: '50px', textTransform: 'none' }}
          >
            Confirmer la commande
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Commande;