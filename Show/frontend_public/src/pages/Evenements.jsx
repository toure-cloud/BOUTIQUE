// src/pages/Evenements.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CalendarToday,
  LocationOn,
  People,
  Event as EventIcon,
  ArrowForward,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { evenementService } from '../services/evenementService';

// Import de l'image par défaut
import heroImage from '../assets/images/tibetia.jpeg';

const Evenements = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('A_VENIR'); // A_VENIR, EN_COURS, TERMINE

  useEffect(() => {
    const fetchEvenements = async () => {
      try {
        setLoading(true);
        const data = await evenementService.getEvenements({ statut: filter });
        const evenementsList = Array.isArray(data) ? data : data.results || [];
        setEvenements(evenementsList);
        setError(null);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les événements. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvenements();
  }, [filter]);

  const getStatusColor = (statut) => {
    const colors = {
      'A_VENIR': '#2C2C2C',
      'EN_COURS': '#4CAF50',
      'TERMINE': '#9E9E9E',
      'ANNULE': '#F44336',
    };
    return colors[statut] || '#9E9E9E';
  };

  const getStatusLabel = (statut) => {
    const labels = {
      'A_VENIR': 'À venir',
      'EN_COURS': 'En cours',
      'TERMINE': 'Terminé',
      'ANNULE': 'Annulé',
    };
    return labels[statut] || statut;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filters = [
    { value: 'A_VENIR', label: 'À venir' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'TERMINE', label: 'Terminés' },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#A0A0A0' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box>
      {/* ===== HERO SECTION ÉVÉNEMENTS ===== */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '200px', md: '300px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: '#2C2C2C',
        }}
      >
        <Box
          component="img"
          src={heroImage}
          alt="Événements Madame Tibetia"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 20%',
            opacity: 0.3,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(44,44,44,0.8) 0%, rgba(44,44,44,0.4) 100%)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography
            variant="overline"
            sx={{
              color: '#A0A0A0',
              letterSpacing: 3,
              fontWeight: 600,
              fontSize: '0.75rem',
              display: 'block',
              mb: 1,
            }}
          >
            MADAME TIBETIA
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: '#FFFFFF',
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '2rem', md: '3.5rem' },
            }}
          >
            Nos Événements
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#E8E8E8',
              mt: 1,
              fontSize: { xs: '1rem', md: '1.2rem' },
            }}
          >
            Des moments d'élégance et de partage
          </Typography>
        </Container>
      </Box>

      {/* ===== FILTRES ===== */}
      <Box sx={{ py: 3, backgroundColor: '#F8F8F8', borderBottom: '1px solid #F0F0F0' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {filters.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? 'contained' : 'outlined'}
                onClick={() => setFilter(f.value)}
                sx={{
                  borderRadius: '50px',
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  ...(filter === f.value
                    ? {
                        backgroundColor: '#2C2C2C',
                        color: '#FFFFFF',
                        '&:hover': { backgroundColor: '#A0A0A0' },
                      }
                    : {
                        borderColor: '#D0D0D0',
                        color: '#666666',
                        '&:hover': {
                          borderColor: '#A0A0A0',
                          backgroundColor: 'rgba(160, 160, 160, 0.05)',
                        },
                      }),
                }}
              >
                {f.label}
              </Button>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ===== LISTE DES ÉVÉNEMENTS ===== */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        {evenements.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: '20px',
              backgroundColor: '#F8F8F8',
            }}
          >
            <EventIcon sx={{ fontSize: 60, color: '#D0D0D0', mb: 2 }} />
            <Typography variant="h5" sx={{ color: '#666666', mb: 1 }}>
              Aucun événement {filter === 'A_VENIR' ? 'à venir' : filter === 'EN_COURS' ? 'en cours' : 'terminé'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#999999' }}>
              Revenez plus tard pour découvrir nos prochains événements.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            {evenements.map((evenement) => (
              <Grid item xs={12} md={6} key={evenement.id}>
                <Card
                  sx={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
                    },
                    height: '100%',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                  }}
                >
                  {/* Image */}
                  <Box
                    sx={{
                      width: { xs: '100%', md: '35%' },
                      height: { xs: '200px', md: 'auto' },
                      position: 'relative',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={evenement.image ? `${import.meta.env.VITE_MEDIA_URL}${evenement.image}` : heroImage}
                      alt={evenement.titre}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    {/* Badge statut */}
                    <Chip
                      label={getStatusLabel(evenement.statut)}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        backgroundColor: getStatusColor(evenement.statut),
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                    {evenement.est_gratuit && (
                      <Chip
                        label="GRATUIT"
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: 16,
                          left: 16,
                          backgroundColor: '#4CAF50',
                          color: '#FFFFFF',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                    )}
                  </Box>

                  {/* Contenu */}
                  <CardContent
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      p: 3,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#A0A0A0',
                        fontWeight: 600,
                        letterSpacing: 0.5,
                        mb: 1,
                      }}
                    >
                      {evenement.theme}
                    </Typography>
                    <Typography
                      variant="h5"
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        color: '#2C2C2C',
                        mb: 2,
                        fontFamily: '"Playfair Display", serif',
                        fontSize: '1.4rem',
                      }}
                    >
                      {evenement.titre}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#666666',
                        mb: 2,
                        lineHeight: 1.6,
                        flexGrow: 1,
                      }}
                    >
                      {evenement.description?.substring(0, 120)}...
                    </Typography>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Infos */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CalendarToday sx={{ color: '#A0A0A0', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: '#666666' }}>
                          {formatDate(evenement.date_debut)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <LocationOn sx={{ color: '#A0A0A0', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: '#666666' }}>
                          {evenement.lieu}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <People sx={{ color: '#A0A0A0', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: '#666666' }}>
                          {evenement.places_restantes} / {evenement.places_total} places
                        </Typography>
                      </Box>
                    </Box>

                    {/* Bouton */}
                    <Button
                      component={Link}
                      to={`/evenements/${evenement.id}`}
                      variant="contained"
                      fullWidth
                      sx={{
                        mt: 2,
                        backgroundColor: '#2C2C2C',
                        color: '#FFFFFF',
                        borderRadius: '50px',
                        py: 1.2,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        '&:hover': {
                          backgroundColor: '#A0A0A0',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#D0D0D0',
                          color: '#999999',
                        },
                      }}
                      disabled={evenement.places_restantes === 0 || evenement.statut === 'TERMINE'}
                      endIcon={evenement.places_restantes > 0 && evenement.statut !== 'TERMINE' ? <ArrowForward /> : null}
                    >
                      {evenement.places_restantes === 0
                        ? 'Complet'
                        : evenement.statut === 'TERMINE'
                        ? 'Terminé'
                        : 'Participer'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* ===== SECTION NEWSLETTER ===== */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          backgroundColor: '#F5F5F5',
          borderTop: '1px solid #F0F0F0',
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#2C2C2C',
              mb: 2,
              fontFamily: '"Playfair Display", serif',
            }}
          >
            Restez informé
          </Typography>
          <Typography variant="body1" sx={{ color: '#666666', mb: 4 }}>
            Recevez nos actualités et les prochains événements en avant-première
          </Typography>
          <Box
            component="form"
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              maxWidth: '500px',
              mx: 'auto',
            }}
          >
            <input
              type="email"
              placeholder="Votre email"
              style={{
                flex: 1,
                padding: '16px 24px',
                borderRadius: '50px',
                border: '1px solid #E8E8E8',
                outline: 'none',
                backgroundColor: '#FFFFFF',
                color: '#2C2C2C',
                fontSize: '1rem',
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#2C2C2C',
                color: '#FFFFFF',
                borderRadius: '50px',
                px: 4,
                py: 1.5,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#A0A0A0',
                },
              }}
            >
              S'inscrire
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Evenements;