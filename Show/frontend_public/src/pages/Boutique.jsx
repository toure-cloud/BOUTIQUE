// src/pages/Boutique.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ShoppingBag,
  Search,
  FilterList,
  Close,
  Star,
  Favorite,
  FavoriteBorder,
  Add,
  Remove,
} from '@mui/icons-material';
import { produitService } from '../services/produitService';
import heroImage from '../assets/images/tibetia.jpeg';

const Boutique = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState('all');
  const [prixRange, setPrixRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState([]);
  const [panier, setPanier] = useState({});

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        setLoading(true);
        const data = await produitService.getProduits();
        const produitsList = Array.isArray(data) ? data : data.results || [];
        setProduits(produitsList);
        setError(null);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les produits. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduits();
  }, []);

  const categories = ['all', ...new Set(produits.map((p) => p.categorie))];

  const filteredProduits = produits.filter((produit) => {
    const matchCategorie = selectedCategorie === 'all' || produit.categorie === selectedCategorie;
    const matchSearch =
      produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produit.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPrix = produit.prix >= prixRange[0] && produit.prix <= prixRange[1];
    return matchCategorie && matchSearch && matchPrix;
  });

  const sortedProduits = [...filteredProduits].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.prix - b.prix;
      case 'price-desc':
        return b.prix - a.prix;
      case 'popular':
        return (b.note || 0) - (a.note || 0);
      default:
        return 0;
    }
  });

  const toggleFavorite = (produitId) => {
    setFavorites((prev) =>
      prev.includes(produitId) ? prev.filter((id) => id !== produitId) : [...prev, produitId]
    );
  };

  const ajouterAuPanier = (produitId) => {
    setPanier((prev) => ({
      ...prev,
      [produitId]: (prev[produitId] || 0) + 1,
    }));
  };

  const retirerDuPanier = (produitId) => {
    setPanier((prev) => {
      const newPanier = { ...prev };
      if (newPanier[produitId] > 1) {
        newPanier[produitId]--;
      } else {
        delete newPanier[produitId];
      }
      return newPanier;
    });
  };

  const getTotalPanier = () => {
    let total = 0;
    let count = 0;
    produits.forEach((p) => {
      if (panier[p.id]) {
        total += p.prix * panier[p.id];
        count += panier[p.id];
      }
    });
    return { total, count };
  };

  const { total, count } = getTotalPanier();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price * 655.96);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
        }}
      >
        <CircularProgress sx={{ color: '#1A1A1A' }} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 10 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      {/* ===== HERO ===== */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 220, md: 320 },
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
          backgroundColor: '#1A1A1A',
        }}
      >
        <Box
          component="img"
          src={heroImage}
          alt="Boutique Madame Tibetia"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 22%',
            filter: 'contrast(1.05) brightness(1.03)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(20,20,20,0.92) 0%, rgba(20,20,20,0.5) 50%, rgba(20,20,20,0.25) 100%)',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pb: { xs: 4, md: 5 } }}>
          <Typography
            variant="overline"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: 4,
              fontWeight: 500,
              fontSize: '0.7rem',
              display: 'block',
              mb: 1.2,
            }}
          >
            MADAME TIBETIA
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 300,
              color: '#FFFFFF',
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '2.2rem', md: '3.4rem' },
              lineHeight: 1.15,
              mb: 1,
            }}
          >
            Notre Boutique
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              fontWeight: 300,
            }}
          >
            Des produits sélectionnés avec soin pour votre élégance
          </Typography>
        </Container>
      </Box>

      {/* ===== BARRE DE RECHERCHE & FILTRES ===== */}
      <Box
        sx={{
          py: 2.5,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #EEEEEE',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 50,
                    backgroundColor: '#FAFAFA',
                    '& fieldset': { borderColor: '#E8E8E8' },
                    '&:hover fieldset': { borderColor: '#CCC' },
                    '&.Mui-focused fieldset': { borderColor: '#1A1A1A' },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#999', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <Close sx={{ fontSize: 16, color: '#999' }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => setFilterOpen(true)}
                  startIcon={<FilterList sx={{ fontSize: 18 }} />}
                  sx={{
                    borderRadius: 50,
                    borderColor: '#DDD',
                    color: '#555',
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 2.5,
                    '&:hover': {
                      borderColor: '#BBB',
                      backgroundColor: 'rgba(0,0,0,0.02)',
                    },
                  }}
                >
                  Filtres
                </Button>

                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel sx={{ color: '#666' }}>Trier par</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Trier par"
                    sx={{
                      borderRadius: 50,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E0E0E0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#CCC',
                      },
                    }}
                  >
                    <MenuItem value="popular">Les plus populaires</MenuItem>
                    <MenuItem value="price-asc">Prix croissant</MenuItem>
                    <MenuItem value="price-desc">Prix décroissant</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===== DIALOG FILTRES ===== */}
      <Dialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: '"Playfair Display", serif' }}>
              Filtres
            </Typography>
            <IconButton onClick={() => setFilterOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom sx={{ fontWeight: 600, mb: 1.5, color: '#333' }}>
            Catégorie
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat === 'all' ? 'Toutes' : cat}
                onClick={() => setSelectedCategorie(cat)}
                sx={{
                  backgroundColor: selectedCategorie === cat ? '#1A1A1A' : '#F5F5F5',
                  color: selectedCategorie === cat ? '#fff' : '#555',
                  fontWeight: selectedCategorie === cat ? 600 : 400,
                  '&:hover': {
                    backgroundColor: selectedCategorie === cat ? '#333' : '#EEE',
                  },
                }}
              />
            ))}
          </Box>

          <Typography gutterBottom sx={{ fontWeight: 600, mb: 1.5, color: '#333' }}>
            Prix
          </Typography>
          <Box sx={{ px: 1 }}>
            <Slider
              value={prixRange}
              onChange={(e, newValue) => setPrixRange(newValue)}
              valueLabelDisplay="auto"
              max={200}
              sx={{
                color: '#1A1A1A',
                '& .MuiSlider-thumb': {
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0 0 0 8px rgba(26,26,26,0.12)',
                  },
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {formatPrice(prixRange[0])}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatPrice(prixRange[1])}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => {
              setSelectedCategorie('all');
              setPrixRange([0, 200]);
            }}
            sx={{ color: '#666', textTransform: 'none' }}
          >
            Réinitialiser
          </Button>
          <Button
            variant="contained"
            onClick={() => setFilterOpen(false)}
            sx={{
              backgroundColor: '#1A1A1A',
              color: '#fff',
              borderRadius: 50,
              px: 3.5,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#333' },
            }}
          >
            Appliquer
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== LISTE DES PRODUITS ===== */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3.5,
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
            {sortedProduits.length} produit{sortedProduits.length > 1 ? 's' : ''}
          </Typography>

          {count > 0 && (
            <Chip
              label={`${count} article${count > 1 ? 's' : ''} • ${formatPrice(total)}`}
              sx={{
                backgroundColor: '#1A1A1A',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.8rem',
                height: 32,
              }}
            />
          )}
        </Box>

        {sortedProduits.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 5, md: 8 },
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid #EEE',
              backgroundColor: '#fff',
            }}
          >
            <ShoppingBag sx={{ fontSize: 56, color: '#DDD', mb: 2 }} />
            <Typography
              variant="h5"
              sx={{
                color: '#1A1A1A',
                mb: 1,
                fontFamily: '"Playfair Display", serif',
                fontWeight: 500,
              }}
            >
              Aucun produit trouvé
            </Typography>
            <Typography variant="body2" sx={{ color: '#888' }}>
              Essayez de modifier vos filtres ou votre recherche.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {sortedProduits.map((produit) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={produit.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid #EEEEEE',
                    overflow: 'hidden',
                    transition: 'transform 0.28s ease, box-shadow 0.28s ease',
                    backgroundColor: '#fff',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.07)',
                    },
                  }}
                >
                  {/* Badge promotion */}
                  {produit.est_en_promotion && (
                    <Chip
                      label={`-${Math.round(
                        (1 - produit.prix_promotion / produit.prix) * 100
                      )}%`}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        backgroundColor: '#E53935',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        height: 24,
                        zIndex: 2,
                      }}
                    />
                  )}

                  {/* Favori */}
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      backgroundColor: 'rgba(255,255,255,0.92)',
                      zIndex: 2,
                      width: 34,
                      height: 34,
                      '&:hover': { backgroundColor: '#fff' },
                    }}
                    onClick={() => toggleFavorite(produit.id)}
                  >
                    {favorites.includes(produit.id) ? (
                      <Favorite sx={{ color: '#E53935', fontSize: 18 }} />
                    ) : (
                      <FavoriteBorder sx={{ color: '#666', fontSize: 18 }} />
                    )}
                  </IconButton>

                  {/* Image */}
                  <Box
                    sx={{
                      height: 210,
                      backgroundColor: '#F5F5F5',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {produit.image_principale ? (
                      <Box
                        component="img"
                        src={`${import.meta.env.VITE_MEDIA_URL}${produit.image_principale}`}
                        alt={produit.nom}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease',
                          '.MuiCard-root:hover &': {
                            transform: 'scale(1.04)',
                          },
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                        }}
                      >
                        <ShoppingBag sx={{ fontSize: 48, color: '#D0D0D0' }} />
                      </Box>
                    )}

                    {/* Stock badges */}
                    {produit.quantite_stock < 5 && produit.quantite_stock > 0 && (
                      <Chip
                        label={`Plus que ${produit.quantite_stock}`}
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: 12,
                          left: 12,
                          backgroundColor: '#FB8C00',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '0.65rem',
                          height: 22,
                        }}
                      />
                    )}
                    {produit.quantite_stock === 0 && (
                      <Chip
                        label="Rupture de stock"
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: 12,
                          left: 12,
                          backgroundColor: '#9E9E9E',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '0.65rem',
                          height: 22,
                        }}
                      />
                    )}
                  </Box>

                  <CardContent
                    sx={{
                      p: 2.5,
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#999',
                        fontWeight: 600,
                        letterSpacing: 0.6,
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        display: 'block',
                        mb: 0.8,
                      }}
                    >
                      {produit.categorie}
                    </Typography>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1A1A1A',
                        fontSize: '0.98rem',
                        lineHeight: 1.35,
                        mb: 1,
                        minHeight: 44,
                        fontFamily: '"Playfair Display", serif',
                      }}
                    >
                      {produit.nom}
                    </Typography>

                    {/* Notes */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mb: 1.5 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          sx={{
                            fontSize: 15,
                            color: star <= (produit.note || 4) ? '#FFB300' : '#E0E0E0',
                          }}
                        />
                      ))}
                      <Typography variant="caption" sx={{ color: '#999', ml: 0.4, fontSize: '0.75rem' }}>
                        ({produit.nb_avis || 0})
                      </Typography>
                    </Box>

                    {/* Prix */}
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.2, mb: 2.2 }}>
                      {produit.est_en_promotion ? (
                        <>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: '#E53935',
                              fontSize: '1.15rem',
                            }}
                          >
                            {formatPrice(produit.prix_promotion)}
                          </Typography>
                          <Typography
                            sx={{
                              color: '#999',
                              textDecoration: 'line-through',
                              fontSize: '0.85rem',
                            }}
                          >
                            {formatPrice(produit.prix)}
                          </Typography>
                        </>
                      ) : (
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: '#1A1A1A',
                            fontSize: '1.15rem',
                          }}
                        >
                          {formatPrice(produit.prix)}
                        </Typography>
                      )}
                    </Box>

                    {/* Actions panier */}
                    <Box sx={{ mt: 'auto' }}>
                      {panier[produit.id] ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#F5F5F5',
                            borderRadius: 50,
                            px: 0.8,
                            py: 0.4,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => retirerDuPanier(produit.id)}
                            sx={{ color: '#555' }}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography sx={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>
                            {panier[produit.id]}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => ajouterAuPanier(produit.id)}
                            sx={{ color: '#555' }}
                            disabled={produit.quantite_stock === 0}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => ajouterAuPanier(produit.id)}
                          disabled={produit.quantite_stock === 0}
                          sx={{
                            backgroundColor: '#1A1A1A',
                            color: '#fff',
                            borderRadius: 50,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            py: 1,
                            '&:hover': { backgroundColor: '#333' },
                            '&.Mui-disabled': {
                              backgroundColor: '#E8E8E8',
                              color: '#999',
                            },
                          }}
                        >
                          {produit.quantite_stock === 0 ? 'Indisponible' : 'Ajouter'}
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* ===== BOUTON PANIER FLOTTANT ===== */}
      {count > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1100,
          }}
        >
          <Button
            component={Link}
            to="/panier"
            variant="contained"
            startIcon={<ShoppingBag />}
            sx={{
              backgroundColor: '#1A1A1A',
              color: '#fff',
              borderRadius: 50,
              px: 3.5,
              py: 1.5,
              fontWeight: 600,
              fontSize: '0.9rem',
              textTransform: 'none',
              boxShadow: '0 10px 30px rgba(0,0,0,0.22)',
              '&:hover': {
                backgroundColor: '#333',
                boxShadow: '0 12px 36px rgba(0,0,0,0.28)',
              },
            }}
          >
            {count} article{count > 1 ? 's' : ''} • {formatPrice(total)}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Boutique;