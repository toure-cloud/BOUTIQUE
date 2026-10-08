// frontend_public/src/pages/Boutique.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Grid, Card, Button, Chip,
  IconButton, TextField, InputAdornment, FormControl, Select,
  MenuItem, Alert, Pagination, Skeleton, Snackbar, alpha,
} from '@mui/material';
import {
  ShoppingBag, Search, Close, Star, Favorite, FavoriteBorder,
  Add, Remove, ArrowForward, Warning, Receipt,
} from '@mui/icons-material';
import { produitService } from '../services/produitService';
import { panierService } from '../services/panierService';
import heroImage from '../assets/images/tibetia.jpeg';

// 🎨 Palette (cohérente avec Header / Footer)
const T = {
  bg: '#FAFAFA',
  surface: '#FFFFFF',
  dark: '#1F1F1F',
  darkSoft: '#2A2A2A',
  textPrimary: '#1F1F1F',
  textSecondary: '#6B6B6B',
  textMuted: '#9A9A9A',
  border: '#E8E8E8',
  accent: '#D4AF37',
  accentSoft: 'rgba(212, 175, 55, 0.12)',
  accentHover: '#C9A961',
  danger: '#DC2626',
  warning: '#D97706',
  success: '#059669',
};

const CATEGORIES = [
  { id: 'robes', label: 'Robes' },
  { id: 'accessoires', label: 'Accessoires' },
  { id: 'chaussures', label: 'Chaussures' },
  { id: 'bijoux', label: 'Bijoux' },
  { id: 'sacs', label: 'Sacs' },
];

const Boutique = () => {
  const navigate = useNavigate();

  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [client, setClient] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchProduits();
  }, [selectedCategorie, page, sortBy]);

  useEffect(() => {
    const storedClient = localStorage.getItem('client_data');
    if (storedClient) {
      setClient(JSON.parse(storedClient));
    }
  }, []);

  const fetchProduits = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, page_size: 12, est_disponible: true };
      if (selectedCategorie !== 'all') params.categorie = selectedCategorie;
      if (sortBy === 'price-asc') params.ordering = 'prix';
      else if (sortBy === 'price-desc') params.ordering = '-prix';
      else params.ordering = '-note';

      const data = await produitService.getProduits(params);
      const produitsList = data.results || data || [];
      setProduits(produitsList);
      setTotalPages(Math.ceil((data.count || produitsList.length || 0) / 12));
    } catch (err) {
      setError('Impossible de charger les produits. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProduits = useMemo(() => {
    let list = [...produits];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.nom?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.categorie?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [produits, searchTerm]);

  const toggleFavorite = (id) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const ajouterAuPanier = async (produit) => {
    if (produit.quantite_stock <= 0) {
      setSnackbar({
        open: true,
        message: 'Ce produit est en rupture de stock',
        severity: 'error',
      });
      return;
    }

    if (!client) {
      setSnackbar({
        open: true,
        message: 'Veuillez vous connecter pour ajouter au panier',
        severity: 'warning',
      });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      await panierService.ajouterProduit(client.id, produit.id, 1);
      setSnackbar({ open: true, message: 'Ajouté au panier !', severity: 'success' });
    } catch (error) {
      if (error.response?.status === 404) {
        localStorage.removeItem('client_data');
        setClient(null);
        setSnackbar({ open: true, message: 'Session expirée. Reconnectez-vous.', severity: 'warning' });
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setSnackbar({ open: true, message: 'Erreur lors de l\'ajout', severity: 'error' });
      }
    }
  };

  const handleDetails = (id) => navigate(`/produit/${id}`);

  const formatPrice = (price) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);

  // ─── PRODUCT CARD ──────────────────────────────────────────
  const renderProductCard = (produit) => {
    if (!produit) return null;

    const imageUrl = produit.image_url || produit.image_principale || heroImage;
    const isFav = favorites.includes(produit.id);
    const isRupture = produit.quantite_stock <= 0;
    const isLowStock = produit.quantite_stock > 0 && produit.quantite_stock < 5;

    return (
      <Card
        key={produit.id}
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          border: `1px solid ${T.border}`,
          bgcolor: T.surface,
          overflow: 'hidden',
          opacity: isRupture ? 0.8 : 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: T.accent,
            boxShadow: `0 16px 40px -12px ${alpha(T.dark, 0.15)}`,
            transform: isRupture ? 'none' : 'translateY(-6px)',
            '& .product-image': {
              transform: isRupture ? 'none' : 'scale(1.06)',
            },
            '& .add-btn': {
              bgcolor: T.accent,
              color: T.dark,
            },
          },
        }}
      >
        {/* Image */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '3 / 4',
            overflow: 'hidden',
            bgcolor: '#F5F5F5',
            flexShrink: 0,
          }}
        >
          <Box
            component="img"
            className="product-image"
            src={imageUrl}
            alt={produit.nom}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = heroImage;
            }}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.6s ease',
              filter: isRupture ? 'grayscale(0.7)' : 'none',
            }}
          />

          {/* Badge promotion */}
          {produit.est_en_promotion && produit.prix_promotion && !isRupture && (
            <Chip
              label={`-${Math.round((1 - produit.prix_promotion / produit.prix) * 100)}%`}
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                bgcolor: T.accent,
                color: T.dark,
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 24,
                borderRadius: 1,
                zIndex: 2,
              }}
            />
          )}

          {/* Badge rupture */}
          {isRupture && (
            <Chip
              icon={<Warning sx={{ fontSize: 14, color: '#fff !important' }} />}
              label="Rupture"
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                bgcolor: T.danger,
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 24,
                borderRadius: 1,
                zIndex: 2,
              }}
            />
          )}

          {/* Badge stock faible */}
          {isLowStock && !isRupture && (
            <Chip
              icon={<Warning sx={{ fontSize: 14, color: '#fff !important' }} />}
              label={`Plus que ${produit.quantite_stock}`}
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                bgcolor: T.warning,
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 24,
                borderRadius: 1,
                zIndex: 2,
              }}
            />
          )}

          {/* Favori */}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(produit.id);
            }}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              bgcolor: alpha('#FFFFFF', 0.95),
              width: 34,
              height: 34,
              zIndex: 2,
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: '#fff', transform: 'scale(1.08)' },
            }}
          >
            {isFav ? (
              <Favorite sx={{ color: '#EF4444', fontSize: 17 }} />
            ) : (
              <FavoriteBorder sx={{ color: T.textSecondary, fontSize: 17 }} />
            )}
          </IconButton>
        </Box>

        {/* Infos */}
        <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography
            sx={{
              color: T.accent,
              fontWeight: 600,
              letterSpacing: 1.2,
              fontSize: '0.68rem',
              textTransform: 'uppercase',
              mb: 0.6,
            }}
          >
            {CATEGORIES.find((c) => c.id === produit.categorie)?.label || produit.categorie}
          </Typography>

          <Typography
            sx={{
              fontWeight: 500,
              color: isRupture ? T.textMuted : T.textPrimary,
              fontSize: '0.95rem',
              lineHeight: 1.35,
              mb: 1,
              fontFamily: '"Playfair Display", serif',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.7em',
            }}
          >
            {produit.nom}
          </Typography>

          {/* Étoiles */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mb: 1.5 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                sx={{
                  fontSize: 13,
                  color: star <= Math.round(produit.note || 4.5) ? T.accent : T.border,
                }}
              />
            ))}
            <Typography sx={{ color: T.textMuted, ml: 0.4, fontSize: '0.75rem' }}>
              ({produit.nb_avis || 0})
            </Typography>
          </Box>

          {/* Prix */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 'auto', mb: 1.5 }}>
            {produit.est_en_promotion && produit.prix_promotion && !isRupture ? (
              <>
                <Typography sx={{ fontWeight: 700, color: T.textPrimary, fontSize: '1.05rem' }}>
                  {formatPrice(produit.prix_promotion)}
                </Typography>
                <Typography sx={{ color: T.textMuted, textDecoration: 'line-through', fontSize: '0.85rem' }}>
                  {formatPrice(produit.prix)}
                </Typography>
              </>
            ) : (
              <Typography
                sx={{
                  fontWeight: 700,
                  color: isRupture ? T.textMuted : T.textPrimary,
                  fontSize: '1.05rem',
                }}
              >
                {formatPrice(produit.prix)}
              </Typography>
            )}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              onClick={() => handleDetails(produit.id)}
              sx={{
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.8rem',
                borderColor: T.border,
                color: T.textSecondary,
                py: 0.9,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: T.textPrimary,
                  color: T.textPrimary,
                  bgcolor: 'transparent',
                },
              }}
            >
              Voir
            </Button>
            <Button
              fullWidth
              size="small"
              variant="contained"
              className="add-btn"
              disabled={isRupture}
              onClick={() => ajouterAuPanier(produit)}
              sx={{
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.75rem',
                bgcolor: isRupture ? T.border : T.dark,
                color: isRupture ? T.textMuted : '#fff',
                py: 0.9,
                boxShadow: 'none',
                transition: 'all 0.25s ease',
                '&:hover': {
                  bgcolor: isRupture ? T.border : T.darkSoft,
                  boxShadow: 'none',
                },
                '&.Mui-disabled': {
                  bgcolor: T.border,
                  color: T.textMuted,
                },
              }}
            >
              {isRupture ? 'Rupture' : 'Ajouter'}
            </Button>
          </Box>
        </Box>
      </Card>
    );
  };

  // ─── LOADING ────────────────────────────────────────────────
  if (loading && produits.length === 0) {
    return (
      <Box sx={{ bgcolor: T.bg, minHeight: '100vh' }}>
        <Box sx={{ height: { xs: 260, md: 380 }, bgcolor: T.border }} />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={item}>
                <Skeleton variant="rectangular" sx={{ aspectRatio: '3/4', borderRadius: 2, mb: 1.5 }} />
                <Skeleton width="40%" height={14} sx={{ mb: 0.5 }} />
                <Skeleton width="80%" height={18} sx={{ mb: 0.5 }} />
                <Skeleton width="30%" height={16} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error && produits.length === 0) {
    return (
      <Box sx={{ bgcolor: T.bg, minHeight: '100vh', py: 10 }}>
        <Container maxWidth="sm">
          <Alert
            severity="error"
            action={<Button color="inherit" size="small" onClick={fetchProduits}>Réessayer</Button>}
            sx={{ borderRadius: 2 }}
          >
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh' }}>
      {/* ─── HERO ─────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 300, md: 440 },
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
          bgcolor: T.dark,
        }}
      >
        <Box
          component="img"
          src={heroImage}
          alt="Boutique"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
            opacity: 0.85,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to top, ${alpha(T.dark, 0.85)} 0%, ${alpha(T.dark, 0.4)} 50%, ${alpha(T.dark, 0.15)} 100%)`,
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pb: { xs: 5, md: 7 } }}>
          <Typography
            sx={{
              color: T.accent,
              letterSpacing: 4,
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              mb: 1.5,
            }}
          >
            Madame Tibetia
          </Typography>
          <Typography
            sx={{
              fontWeight: 500,
              color: '#fff',
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '2.5rem', md: '3.8rem' },
              lineHeight: 1.05,
              mb: 1.5,
              letterSpacing: -0.8,
            }}
          >
            Boutique
          </Typography>
          <Typography
            sx={{
              color: alpha('#FFFFFF', 0.85),
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              maxWidth: 460,
              lineHeight: 1.6,
              fontWeight: 300,
            }}
          >
            Pièces sélectionnées pour sublimer votre élégance au quotidien
          </Typography>
        </Container>
      </Box>

      {/* ─── CATÉGORIES ───────────────────────────────── */}
      <Box sx={{ bgcolor: T.surface, borderBottom: `1px solid ${T.border}` }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              py: 2.5,
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            <Chip
              label="Tout"
              onClick={() => { setSelectedCategorie('all'); setPage(1); }}
              sx={{
                borderRadius: 1,
                fontWeight: selectedCategorie === 'all' ? 600 : 500,
                bgcolor: selectedCategorie === 'all' ? T.dark : '#F5F5F5',
                color: selectedCategorie === 'all' ? '#fff' : T.textSecondary,
                px: 1.5,
                py: 1.8,
                transition: 'all 0.25s ease',
                '&:hover': {
                  bgcolor: selectedCategorie === 'all' ? T.darkSoft : alpha(T.accent, 0.15),
                  color: selectedCategorie === 'all' ? '#fff' : T.textPrimary,
                },
              }}
            />
            {CATEGORIES.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.label}
                onClick={() => { setSelectedCategorie(cat.id); setPage(1); }}
                sx={{
                  borderRadius: 1,
                  fontWeight: selectedCategorie === cat.id ? 600 : 500,
                  bgcolor: selectedCategorie === cat.id ? T.dark : '#F5F5F5',
                  color: selectedCategorie === cat.id ? '#fff' : T.textSecondary,
                  px: 1.5,
                  py: 1.8,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    bgcolor: selectedCategorie === cat.id ? T.darkSoft : alpha(T.accent, 0.15),
                    color: selectedCategorie === cat.id ? '#fff' : T.textPrimary,
                  },
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* ─── TOOLBAR ──────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: alpha(T.surface, 0.95),
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${T.border}`,
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 2,
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <TextField
              placeholder="Rechercher une pièce..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{
                flex: 1,
                maxWidth: { xs: '100%', md: 360 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  bgcolor: '#F8F8F8',
                  fontSize: '0.875rem',
                  '& fieldset': { borderColor: T.border },
                  '&:hover fieldset': { borderColor: alpha(T.accent, 0.5) },
                  '&.Mui-focused fieldset': { borderColor: T.accent },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: T.textMuted, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <Close sx={{ fontSize: 16, color: T.textMuted }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<Receipt sx={{ fontSize: 18 }} />}
                onClick={() => navigate('/panier')}
                sx={{
                  borderRadius: 1.5,
                  borderColor: T.border,
                  color: T.textPrimary,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  px: 2,
                  py: 0.8,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: T.accent,
                    color: T.accent,
                    bgcolor: T.accentSoft,
                  },
                }}
              >
                Mes commandes
              </Button>

              <Typography
                sx={{
                  color: T.textMuted,
                  fontSize: '0.875rem',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                {filteredProduits.length} pièce{filteredProduits.length > 1 ? 's' : ''}
              </Typography>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <Select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  displayEmpty
                  sx={{
                    borderRadius: 1.5,
                    fontSize: '0.875rem',
                    bgcolor: '#F8F8F8',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: T.border },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(T.accent, 0.5),
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: T.accent,
                    },
                  }}
                >
                  <MenuItem value="popular">Popularité</MenuItem>
                  <MenuItem value="price-asc">Prix croissant</MenuItem>
                  <MenuItem value="price-desc">Prix décroissant</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ─── PRODUITS ─────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {filteredProduits.length === 0 ? (
          <Box sx={{ py: 12, textAlign: 'center' }}>
            <ShoppingBag sx={{ fontSize: 48, color: T.border, mb: 2 }} />
            <Typography
              sx={{
                fontSize: '1.5rem',
                fontWeight: 500,
                color: T.textPrimary,
                mb: 1,
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Aucune pièce trouvée
            </Typography>
            <Typography sx={{ color: T.textSecondary, mb: 3, fontSize: '0.95rem' }}>
              {searchTerm ? 'Essayez un autre mot-clé' : 'Aucun produit dans cette catégorie'}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => { setSearchTerm(''); setSelectedCategorie('all'); setPage(1); }}
              sx={{
                borderRadius: 1.5,
                borderColor: T.textPrimary,
                color: T.textPrimary,
                textTransform: 'none',
                px: 3,
                fontWeight: 500,
                '&:hover': {
                  borderColor: T.accent,
                  color: T.accent,
                  bgcolor: T.accentSoft,
                },
              }}
            >
              Réinitialiser les filtres
            </Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {filteredProduits.map((produit) => (
                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={produit.id}>
                  {renderProductCard(produit)}
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: 1.5,
                      fontWeight: 500,
                      color: T.textSecondary,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: T.accentSoft,
                        color: T.accent,
                      },
                      '&.Mui-selected': {
                        bgcolor: T.dark,
                        color: '#fff',
                        '&:hover': { bgcolor: T.darkSoft },
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* ─── CTA ──────────────────────────────────────── */}
      <Box
        sx={{
          py: { xs: 9, md: 12 },
          bgcolor: T.dark,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 80,
            height: 2,
            bgcolor: T.accent,
          },
        }}
      >
        <Container maxWidth="sm">
          <Typography
            sx={{
              fontFamily: '"Playfair Display", serif',
              color: '#fff',
              fontSize: { xs: '1.9rem', md: '2.5rem' },
              fontWeight: 500,
              mb: 2,
              letterSpacing: -0.5,
            }}
          >
            L'élégance commence ici
          </Typography>
          <Typography
            sx={{
              color: alpha('#FFFFFF', 0.65),
              mb: 4,
              fontSize: '1rem',
              fontWeight: 300,
              lineHeight: 1.7,
            }}
          >
            Découvrez également nos forfaits relooking et formations en ligne
          </Typography>
          <Button
            component={Link}
            to="/forfaits"
            variant="contained"
            endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: T.accent,
              color: T.dark,
              borderRadius: 1.5,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              boxShadow: 'none',
              transition: 'all 0.25s ease',
              '&:hover': {
                bgcolor: T.accentHover,
                boxShadow: `0 12px 28px -8px ${alpha(T.accent, 0.5)}`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            Voir les forfaits
          </Button>
        </Container>
      </Box>

      {/* ─── SNACKBAR ─────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ borderRadius: 1.5 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Boutique;