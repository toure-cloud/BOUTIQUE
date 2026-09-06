// src/pages/Evenements.jsx
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
  CircularProgress,
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
  Avatar,
} from '@mui/material';
import {
  Search,
  Event,
  CalendarToday,
  LocationOn,
  People,
  AttachMoney,
  ArrowForward,
  Clear,
  FilterList,
  Star,
  CheckCircle,
  Pending,
  Cancel,
} from '@mui/icons-material';
import { evenementService } from '../services/evenementService';
import heroImage from '../assets/images/tibetia.jpeg';

const Evenements = () => {
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const statuts = [
    { value: 'A_VENIR', label: 'À venir', color: '#3B82F6' },
    { value: 'EN_COURS', label: 'En cours', color: '#EF4444' },
    { value: 'TERMINE', label: 'Terminé', color: '#10B981' },
    { value: 'ANNULE', label: 'Annulé', color: '#6B7280' },
  ];

  useEffect(() => {
    fetchEvenements();
  }, [page, filterStatut]);

  const fetchEvenements = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page,
        page_size: 9,
      };
      if (filterStatut) params.statut = filterStatut;
      
      const data = await evenementService.getEvenements(params);
      console.log('📋 Événements reçus:', data);
      
      const evenementsList = data.results || data || [];
      setEvenements(evenementsList);
      setTotalCount(data.count || evenementsList.length || 0);
      setTotalPages(Math.ceil((data.count || evenementsList.length || 0) / 9));
    } catch (err) {
      console.error('❌ Erreur chargement événements:', err);
      setError('Impossible de charger les événements. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const filtered = evenements.filter(e => 
        e.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.theme?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setEvenements(filtered);
    } else {
      fetchEvenements();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchEvenements();
  };

  const getStatutChip = (statut) => {
    const config = statuts.find(s => s.value === statut);
    if (!config) return <Chip label={statut} size="small" />;
    
    let icon = null;
    if (statut === 'A_VENIR') icon = <Pending sx={{ fontSize: 14 }} />;
    else if (statut === 'EN_COURS') icon = <CheckCircle sx={{ fontSize: 14 }} />;
    else if (statut === 'TERMINE') icon = <CheckCircle sx={{ fontSize: 14 }} />;
    else if (statut === 'ANNULE') icon = <Cancel sx={{ fontSize: 14 }} />;
    
    return (
      <Chip
        icon={icon}
        label={config.label}
        size="small"
        sx={{
          backgroundColor: `${config.color}15`,
          color: config.color,
          fontWeight: 600,
          '& .MuiChip-icon': { color: config.color },
        }}
      />
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
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
      <Box sx={{ bgcolor: '#FFF5F3', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 5, textAlign: 'center' }}>
            <Skeleton variant="text" width={200} height={30} sx={{ mx: 'auto' }} />
            <Skeleton variant="text" width={300} height={50} sx={{ mx: 'auto' }} />
            <Skeleton variant="text" width={400} height={25} sx={{ mx: 'auto' }} />
          </Box>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Card sx={{ borderRadius: '16px' }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="rectangular" height={36} sx={{ mt: 2, borderRadius: '50px' }} />
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
      <Box sx={{ bgcolor: '#FFF5F3', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="lg">
          <Alert 
            severity="error" 
            sx={{ borderRadius: '12px' }}
            action={
              <Button color="inherit" size="small" onClick={fetchEvenements}>
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
    <Box sx={{ bgcolor: '#FFF5F3', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* ===== EN-TÊTE ===== */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography
            variant="overline"
            sx={{
              color: '#D4A5A0',
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
              color: '#4A3728',
              mb: 1,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Événements
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#7A5A4A',
              maxWidth: '600px',
              mx: 'auto',
              fontSize: { xs: '0.95rem', md: '1.1rem' },
            }}
          >
            Découvrez nos événements exclusifs et réservez votre place
          </Typography>
          <Box
            sx={{
              width: '60px',
              height: '3px',
              bgcolor: '#D4A5A0',
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
            border: '1px solid #F5E8E5',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <TextField
              fullWidth
              placeholder="Rechercher un événement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <Button size="small" onClick={handleClearSearch}>
                      <Clear sx={{ fontSize: 16 }} />
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ minWidth: 150 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Statut</InputLabel>
              <Select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                label="Statut"
              >
                <MenuItem value="">Tous</MenuItem>
                {statuts.map((s) => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Button
            variant="outlined"
            onClick={fetchEvenements}
            startIcon={<FilterList />}
            size="small"
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Actualiser
          </Button>
        </Paper>

        {/* ===== STATISTIQUES ===== */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#7A5A4A' }}>
            <strong style={{ color: '#4A3728' }}>{totalCount}</strong> événement{totalCount > 1 ? 's' : ''} trouvé{totalCount > 1 ? 's' : ''}
          </Typography>
        </Box>

        {/* ===== GRILLE ===== */}
        {evenements.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: '1px solid #F5E8E5',
            }}
          >
            <Event sx={{ fontSize: 60, color: '#D4A5A0', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#4A3728', mb: 1 }}>
              Aucun événement trouvé
            </Typography>
            <Typography variant="body2" sx={{ color: '#7A5A4A' }}>
              {searchTerm || filterStatut ? 'Essayez de modifier vos filtres' : 'Revenez plus tard pour découvrir nos événements'}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {evenements.map((evenement) => (
              <Grid item xs={12} sm={6} md={4} key={evenement.id}>
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
                      boxShadow: '0 20px 60px rgba(212, 165, 160, 0.25)',
                    },
                    border: '1px solid #F5E8E5',
                    bgcolor: '#FFFFFF',
                    position: 'relative',
                  }}
                >
                  {/* Statut */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      zIndex: 2,
                    }}
                  >
                    {getStatutChip(evenement.statut)}
                  </Box>

                  {/* Image */}
                  <CardMedia
                    component="img"
                    height={200}
                    image={evenement.image ? `${import.meta.env.VITE_MEDIA_URL}${evenement.image}` : heroImage}
                    alt={evenement.titre}
                    sx={{ objectFit: 'cover' }}
                  />

                  <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                    {/* Thème */}
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#D4A5A0',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      {evenement.theme}
                    </Typography>

                    {/* Titre */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#4A3728',
                        fontFamily: '"Playfair Display", serif',
                        fontSize: '1.05rem',
                        lineHeight: 1.3,
                        minHeight: '48px',
                        mb: 1.5,
                      }}
                    >
                      {evenement.titre}
                    </Typography>

                    {/* Infos */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 16, color: '#D4A5A0' }} />
                        <Typography variant="body2" sx={{ color: '#7A5A4A', fontSize: '0.85rem' }}>
                          {formatDate(evenement.date_debut)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ fontSize: 16, color: '#D4A5A0' }} />
                        <Typography variant="body2" sx={{ color: '#7A5A4A', fontSize: '0.85rem' }}>
                          {evenement.lieu}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <People sx={{ fontSize: 16, color: '#D4A5A0' }} />
                        <Typography variant="body2" sx={{ color: '#7A5A4A', fontSize: '0.85rem' }}>
                          {evenement.places_restantes || 0} places restantes
                        </Typography>
                      </Box>
                      {!evenement.est_gratuit && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoney sx={{ fontSize: 16, color: '#D4A5A0' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#4A3728' }}>
                            {formatPrice(evenement.prix)}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Bouton */}
                    <Button
                      component={Link}
                      to={`/evenements/${evenement.id}`}
                      variant="contained"
                      fullWidth
                      disabled={evenement.places_restantes === 0 || evenement.statut === 'ANNULE'}
                      sx={{
                        backgroundColor: evenement.places_restantes === 0 ? '#E8E0DD' : '#4A3728',
                        color: evenement.places_restantes === 0 ? '#B0A8A5' : '#FFF5F3',
                        borderRadius: '50px',
                        py: 1,
                        textTransform: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: '#D4A5A0',
                          color: '#4A3728',
                          transform: 'scale(1.02)',
                        },
                      }}
                      endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                    >
                      {evenement.places_restantes === 0 ? 'Complet' : 'Voir les détails'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* ===== PAGINATION ===== */}
        {evenements.length > 0 && totalPages > 1 && (
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
                    backgroundColor: '#D4A5A0',
                    color: '#FFFFFF',
                    '&:hover': { backgroundColor: '#C08A85' },
                  },
                },
              }}
            />
          </Box>
        )}

        {/* ===== BANDEAU CTA ===== */}
        <Box
          sx={{
            mt: 6,
            p: { xs: 4, md: 6 },
            borderRadius: '16px',
            backgroundColor: '#4A3728',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              backgroundColor: 'rgba(212, 165, 160, 0.1)',
            }}
          />
          <Typography
            sx={{
              fontFamily: '"Playfair Display", serif',
              color: '#FFFFFF',
              fontSize: { xs: '1.5rem', md: '2.2rem' },
              fontWeight: 300,
              mb: 1.5,
              position: 'relative',
              zIndex: 1,
            }}
          >
            Envie de plus d'élégance ?
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.7)',
              mb: 3,
              fontSize: '1rem',
              position: 'relative',
              zIndex: 1,
            }}
          >
            Découvrez nos formations en ligne pour développer votre style
          </Typography>
          <Button
            component={Link}
            to="/formations"
            variant="contained"
            endIcon={<ArrowForward />}
            sx={{
              backgroundColor: '#FFFFFF',
              color: '#4A3728',
              borderRadius: 50,
              px: 4,
              py: 1.4,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              position: 'relative',
              zIndex: 1,
              '&:hover': { backgroundColor: '#F5F0ED' },
            }}
          >
            Voir les formations
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Evenements;