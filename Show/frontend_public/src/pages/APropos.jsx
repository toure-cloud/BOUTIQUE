// src/pages/APropos.jsx
import React from 'react';
import { Container, Typography, Box, Paper, Grid, Avatar } from '@mui/material';
import { EmojiEvents, People, School } from '@mui/icons-material';

const APropos = () => {
  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom textAlign="center" fontWeight="bold">
        À Propos
      </Typography>
      
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Madame T - Votre Coach Professionnelle
        </Typography>
        <Typography variant="body1" paragraph>
          Passionnée par le développement personnel et professionnel, Madame T vous accompagne 
          dans votre transformation vers une vie plus épanouie et réussie.
        </Typography>
        <Typography variant="body1" paragraph>
          Avec plus de 10 ans d'expérience dans le coaching, elle a aidé des centaines de personnes 
          à atteindre leurs objectifs et à réaliser leur plein potentiel.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <EmojiEvents sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Expertise
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Coaching certifié avec une approche personnalisée adaptée à chaque client
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <People sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Communauté
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Une communauté grandissante de personnes transformées
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <School sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Formation Continue
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Des méthodes innovantes et constamment mises à jour
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Rejoignez l'aventure Show Coaching
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Commencez votre transformation dès aujourd'hui
        </Typography>
      </Box>
    </Container>
  );
};

export default APropos;