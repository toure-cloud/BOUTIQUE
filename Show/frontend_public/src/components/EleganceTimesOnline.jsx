// src/components/EleganceTimesOnline.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ArrowForward, PlayArrow, LiveTv, Lock, CheckCircle } from '@mui/icons-material';
import { formationService } from '../services/formationService';

const EleganceTimesOnline = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        setLoading(true);
        const data = await formationService.getFormations();
        const list = Array.isArray(data) ? data : data.results || [];
        setFormations(list);
        setError(null);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les formations');
      } finally {
        setLoading(false);
      }
    };
    fetchFormations();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#A0A0A0' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            color: '#2C2C2C',
            mb: 1,
            fontFamily: '"Playfair Display", serif',
            fontSize: { xs: '2rem', md: '3rem' },
          }}
        >
          Elegance Times online
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            color: '#666666',
            mb: 4,
            maxWidth: '600px',
            mx: 'auto',
          }}
        >
          Formations en ligne - Payant, avec code d'accès unique
        </Typography>

        {/* ===== SCROLL HORIZONTAL ===== */}
        <Box
          sx={{
            overflowX: 'auto',
            overflowY: 'hidden',
            whiteSpace: 'nowrap',
            WebkitOverflowScrolling: 'touch',
            pb: 2,
            '&::-webkit-scrollbar': {
              height: '6px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#F5F5F5',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#D0D0D0',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#A0A0A0',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 3,
              width: 'fit-content',
              mx: 'auto',
            }}
          >
            {formations.map((formation) => (
              <Card
                key={formation.id}
                sx={{
                  minWidth: { xs: '280px', sm: '320px', md: '350px' },
                  maxWidth: { xs: '280px', sm: '320px', md: '350px' },
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.08)',
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  height: { xs: '420px', md: '460px' },
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                {/* ===== STATUT BADGE ===== */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    zIndex: 2,
                    display: 'flex',
                    gap: 1,
                  }}
                >
                  {formation.est_live && (
                    <Chip
                      icon={<LiveTv sx={{ fontSize: 16, color: '#FF1744' }} />}
                      label="🔴 LIVE"
                      sx={{
                        backgroundColor: '#FF1744',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        height: 24,
                        animation: 'pulse 1.5s infinite',
                        '@keyframes pulse': {
                          '0%': { opacity: 1 },
                          '50%': { opacity: 0.5 },
                          '100%': { opacity: 1 },
                        },
                      }}
                    />
                  )}
                  {formation.est_replay && (
                    <Chip
                      label="📺 REPLAY"
                      sx={{
                        backgroundColor: '#2C2C2C',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        height: 24,
                      }}
                    />
                  )}
                  {!formation.est_live && !formation.est_replay && formation.statut === 'PROGRAMME' && (
                    <Chip
                      label="📅 PROGRAMMÉ"
                      sx={{
                        backgroundColor: '#F5F5F5',
                        color: '#666666',
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        height: 24,
                      }}
                    />
                  )}
                </Box>

                {/* ===== IMAGE ===== */}
                <Box
                  sx={{
                    height: { xs: 160, md: 180 },
                    backgroundColor: '#E8E8E8',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {formation.image ? (
                    <CardMedia
                      component="img"
                      image={`${import.meta.env.VITE_MEDIA_URL}${formation.image}`}
                      alt={formation.titre}
                      sx={{ height: '100%', width: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        backgroundColor: '#E8E8E8',
                      }}
                    >
                      <Typography variant="h1" sx={{ opacity: 0.3, fontSize: '4rem' }}>
                        🎓
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Overlay si live */}
                  {formation.est_live && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 23, 68, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Chip
                        icon={<PlayArrow sx={{ color: '#FFFFFF' }} />}
                        label="EN DIRECT"
                        sx={{
                          backgroundColor: 'rgba(255, 23, 68, 0.9)',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '1rem',
                          px: 3,
                          py: 2,
                          borderRadius: '50px',
                        }}
                      />
                    </Box>
                  )}
                </Box>

                {/* ===== CONTENU ===== */}
                <CardContent
                  sx={{
                    flexGrow: 1,
                    p: { xs: 2, md: 2.5 },
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: '#2C2C2C',
                      fontSize: { xs: '0.95rem', md: '1.1rem' },
                      fontFamily: '"Playfair Display", serif',
                      lineHeight: 1.2,
                      mb: 0.5,
                      minHeight: { xs: '44px', md: '52px' },
                    }}
                  >
                    {formation.titre}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#666666',
                      fontSize: { xs: '0.7rem', md: '0.8rem' },
                      lineHeight: 1.4,
                      mb: 1.5,
                      minHeight: { xs: '36px', md: '44px' },
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {formation.description}
                  </Typography>

                  {/* ===== INFOS ===== */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" sx={{ color: '#999999' }}>Prix</Typography>
                      <Typography variant="body2" sx={{ color: '#2C2C2C', fontWeight: 700 }}>
                        {formation.prix_formate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" sx={{ color: '#999999' }}>Durée</Typography>
                      <Typography variant="body2" sx={{ color: '#666666' }}>
                        {formation.duree}
                      </Typography>
                    </Box>
                    {formation.date_live && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ color: '#999999' }}>Date</Typography>
                        <Typography variant="body2" sx={{ color: '#666666' }}>
                          {new Date(formation.date_live).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* ===== BOUTONS ===== */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                    <Button
                      component={Link}
                      to={`/formations/${formation.id}`}
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: formation.est_live ? '#FF1744' : '#2C2C2C',
                        color: '#FFFFFF',
                        borderRadius: '50px',
                        py: 0.8,
                        textTransform: 'none',
                        fontSize: { xs: '0.65rem', md: '0.75rem' },
                        '&:hover': {
                          backgroundColor: formation.est_live ? '#D50000' : '#A0A0A0',
                        },
                      }}
                      endIcon={formation.est_live ? <PlayArrow /> : <ArrowForward />}
                    >
                      {formation.est_live ? 'REJOINDRE' : 'DÉTAILS'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* ===== AFFICHAGE DU NOMBRE DE FORMATIONS ===== */}
        {formations.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6, backgroundColor: '#F8F8F8', borderRadius: '16px' }}>
            <Typography variant="h5" sx={{ color: '#666666' }}>
              Aucune formation disponible
            </Typography>
            <Typography variant="body2" sx={{ color: '#999999' }}>
              Revenez plus tard pour découvrir nos formations
            </Typography>
          </Box>
        )}

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            component={Link}
            to="/formations"
            variant="text"
            sx={{
              color: '#2C2C2C',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              letterSpacing: 1,
              '&:hover': {
                color: '#A0A0A0',
                backgroundColor: 'transparent',
              },
            }}
          >
            VIEW ALL FORMATIONS
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default EleganceTimesOnline;