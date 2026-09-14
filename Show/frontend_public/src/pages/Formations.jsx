// frontend_public/src/pages/Formations.jsx
import React, { useState, useEffect } from 'react';
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
  Alert,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Paper,
  Skeleton,
} from '@mui/material';
import {
  Search,
  VideoLibrary,
  PlayArrow,
  Replay,
  Schedule,
  CheckCircle,
  AttachMoney,
  AccessTime,
  ArrowForward,
  Clear,
} from '@mui/icons-material';
import { formationService } from '../services/formationService';
import { getMediaUrl } from '../utils/media';
import heroImage from '../assets/images/tibetia.jpeg';

const Formations = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const statuts = [
    { value: 'PROGRAMME', label: 'Programmé', color: '#3B82F6' },
    { value: 'LIVE', label: 'En direct', color: '#EF4444' },
    { value: 'REPLAY', label: 'Replay', color: '#F59E0B' },
    { value: 'TERMINE', label: 'Terminé', color: '#10B981' },
  ];

  useEffect(() => {
    fetchFormations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterStatut]);

  const fetchFormations = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page,
        page_size: 9,
      };
      if (filterStatut) params.statut = filterStatut;

      const data = await formationService.getFormations(params);
      console.log('📋 Formations reçues:', data);

      const formationsList = data.results || data || [];
      setFormations(formationsList);
      setTotalPages(Math.ceil((data.count || formationsList.length || 0) / 9));
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError('Impossible de charger les formations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const filtered = formations.filter(
        (f) =>
          f.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFormations(filtered);
    } else {
      fetchFormations();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchFormations();
  };

  const getStatutChip = (statut) => {
    const config = statuts.find((s) => s.value === statut);
    if (!config) return <Chip label={statut} size="small" />;

    let icon = null;
    if (statut === 'LIVE') icon = <PlayArrow sx={{ fontSize: 14 }} />;
    else if (statut === 'REPLAY') icon = <Replay sx={{ fontSize: 14 }} />;
    else if (statut === 'PROGRAMME') icon = <Schedule sx={{ fontSize: 14 }} />;
    else if (statut === 'TERMINE') icon = <CheckCircle sx={{ fontSize: 14 }} />;

    return (
      <Chip
        icon={icon}
        label={config.label}
        size="small"
        sx={{
          backgroundColor: `${config.color}15`,
          color: config.color,
          fontWeight: 600,
        }}
      />
    );
  };

  const formatPrice = (price) => {
    if (!price) return 'Gratuit';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#F5F7F5', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 5, textAlign: 'center' }}>
            <Skeleton variant="text" width={200} height={30} sx={{ mx: 'auto' }} />
            <Skeleton variant="text" width={300} height={50} sx={{ mx: 'auto' }} />
            <Skeleton variant="text" width={400} height={25} sx={{ mx: 'auto' }} />
          </Box>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item}>
                <Card sx={{ borderRadius: '16px' }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="40%" />
                    <Skeleton
                      variant="rectangular"
                      height={36}
                      sx={{ mt: 2, borderRadius: '50px' }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: '#F5F7F5', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="lg">
          <Alert
            severity="error"
            sx={{ borderRadius: '12px' }}
            action={
              <Button color="inherit" size="small" onClick={fetchFormations}>
                Réessayer
              </Button>
            }
          >
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F5F7F5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* ===== EN-TÊTE ===== */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography
            variant="overline"
            sx={{
              color: '#2E7D32',
              letterSpacing: 4,
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
              fontFamily: '"Playfair Display", serif',
              color: '#1A1A1A',
              mb: 1,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Formations en ligne
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#666666',
              maxWidth: '600px',
              mx: 'auto',
              fontSize: { xs: '0.95rem', md: '1.1rem' },
            }}
          >
            Développez votre élégance avec nos formations exclusives
          </Typography>
          <Box
            sx={{
              width: '60px',
              height: '3px',
              bgcolor: '#2E7D32',
              mx: 'auto',
              mt: 2,
              borderRadius: '2px',
            }}
          />
        </Box>

        {/* ===== BARRE DE RECHERCHE ===== */}
        <Paper
          sx={{
            p: 2,
            mb: 4,
            borderRadius: '12px',
            border: '1px solid #E8F5E9',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <TextField
              fullWidth
              placeholder="Rechercher une formation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm ? (
                    <InputAdornment position="end">
                      <Button size="small" onClick={handleClearSearch}>
                        <Clear sx={{ fontSize: 16 }} />
                      </Button>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
          </Box>

          <Box sx={{ minWidth: 150 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="statut-label">Statut</InputLabel>
              <Select
                labelId="statut-label"
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                label="Statut"
              >
                <MenuItem value="">Tous</MenuItem>
                {statuts.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Button
            variant="outlined"
            onClick={fetchFormations}
            size="small"
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Actualiser
          </Button>
        </Paper>

        {/* ===== GRILLE ===== */}
        {formations.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: '1px solid #E8F5E9',
            }}
          >
            <VideoLibrary sx={{ fontSize: 60, color: '#94A3B8', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#1A1A1A', mb: 1 }}>
              Aucune formation trouvée
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666' }}>
              {searchTerm || filterStatut
                ? 'Essayez de modifier vos filtres'
                : 'Revenez plus tard'}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {formations.map((formation) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={formation.id}>
                <Card
                  sx={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 20px 60px rgba(46, 125, 50, 0.15)',
                    },
                    border: '1px solid #E8F5E9',
                    bgcolor: '#FFFFFF',
                    position: 'relative',
                  }}
                >
                  {/* Statut */}
                  <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                    {getStatutChip(formation.statut)}
                  </Box>

                  {/* Image */}
                  <CardMedia
                    component="img"
                    height={200}
                    image={getMediaUrl(formation.image) || heroImage}
                    alt={formation.titre}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = heroImage;
                    }}
                    sx={{ objectFit: 'cover' }}
                  />

                  <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                    {/* Titre */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#1A1A1A',
                        fontFamily: '"Playfair Display", serif',
                        fontSize: '1.05rem',
                        lineHeight: 1.3,
                        minHeight: '48px',
                        mb: 1,
                      }}
                    >
                      {formation.titre}
                    </Typography>

                    {/* Description courte */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#666666',
                        fontSize: '0.85rem',
                        lineHeight: 1.6,
                        mb: 2,
                        flexGrow: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {formation.description}
                    </Typography>

                    {/* Infos */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney sx={{ fontSize: 16, color: '#2E7D32' }} />
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: '#1A1A1A' }}
                        >
                          {formatPrice(formation.prix)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime sx={{ fontSize: 16, color: '#2E7D32' }} />
                        <Typography
                          variant="body2"
                          sx={{ color: '#666666', fontSize: '0.85rem' }}
                        >
                          {formation.duree || 'Durée non spécifiée'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Bouton */}
                    <Button
                      component={Link}
                      to={`/formations/${formation.id}`}
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: '#2E7D32',
                        borderRadius: '50px',
                        py: 1,
                        textTransform: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        '&:hover': { backgroundColor: '#1B5E20' },
                      }}
                      endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                    >
                      Voir la formation
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* ===== PAGINATION ===== */}
        {formations.length > 0 && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '8px',
                  '&.Mui-selected': {
                    backgroundColor: '#2E7D32',
                    color: '#FFFFFF',
                  },
                },
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Formations;