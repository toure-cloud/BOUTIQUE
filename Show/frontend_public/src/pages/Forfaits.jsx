// src/pages/Forfaits.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Check, Star } from '@mui/icons-material';
import { forfaitService } from '../services/forfaitService';

const Forfaits = () => {
  const [forfaits, setForfaits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForfaits = async () => {
      try {
        const data = await forfaitService.getForfaits();
        // Gérer différents formats de réponse
        const forfaitsList = Array.isArray(data) ? data : data.results || [];
        setForfaits(forfaitsList);
      } catch (err) {
        setError('Impossible de charger les forfaits');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchForfaits();
  }, []);

  const getTypeColor = (type) => {
    const colors = {
      DEBUTANT: 'success',
      INTERMEDIAIRE: 'info',
      AVANCE: 'warning',
      PREMIUM: 'error',
    };
    return colors[type] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ textAlign: 'center' }} fontWeight="bold">
        Nos Forfaits de Coaching
      </Typography>
      <Typography variant="body1" sx={{ textAlign: 'center', mb: 6 }} color="text.secondary">
        Choisissez le forfait qui correspond à vos objectifs et à votre niveau
      </Typography>

      <Grid container spacing={4}>
        {forfaits.map((forfait) => (
          <Grid item xs={12} md={6} lg={4} key={forfait.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-8px)',
                  transition: 'all 0.3s ease',
                },
              }}
            >
              {forfait.type === 'PREMIUM' && (
                <Chip
                  icon={<Star />}
                  label="Premium"
                  color="warning"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                  }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  {forfait.nom}
                </Typography>
                <Chip
                  label={forfait.type}
                  color={getTypeColor(forfait.type)}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {forfait.description}
                </Typography>
                <Typography variant="h4" color="secondary.main" gutterBottom>
                  {forfait.prix}€
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Check color="success" fontSize="small" />
                    <Typography variant="body2">{forfait.duree} jours</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Check color="success" fontSize="small" />
                    <Typography variant="body2">{forfait.nb_seances} séances</Typography>
                  </Box>
                  {forfait.caracteristiques && forfait.caracteristiques.map((carac, index) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} key={index}>
                      <Check color="success" fontSize="small" />
                      <Typography variant="body2">{carac}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  component={Link}
                  to={`/forfaits/${forfait.id}`}
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Choisir ce forfait
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Forfaits;