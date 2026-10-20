// frontend_public/src/pages/Boutique.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Alert,
  Pagination,
  Skeleton,
  Snackbar,
  alpha,
  Fade,
  Grow,
} from '@mui/material';
import {
  ShoppingBag,
  Search,
  Close,
  Star,
  Favorite,
  FavoriteBorder,
  ArrowForward,
  Warning,
  Receipt,
  LocalOffer,
} from '@mui/icons-material';
import { produitService } from '../services/produitService';
import { panierService } from '../services/panierService';
import heroImage from '../assets/images/tibetia.jpeg';

// ─────────────────────────────────────────────────────────────
// PALETTE PREMIUM
// ─────────────────────────────────────────────────────────────
const T = {
  bg: '#F8F7F4',
  surface: '#FFFFFF',
  dark: '#1A1A1A',
  darkSoft: '#2C2C2C',
  textPrimary: '#1A1A1A',
  textSecondary: '#5C5C5C',
  textMuted: '#8A8A8A',
  border: '#EAEAEA',
  accent: '#C9A84C',          // or plus raffiné
  accentSoft: 'rgba(201, 168, 76, 0.12)',
  accentHover: '#B8943A',
  danger: '#B91C1C',
  warning: '#B45309',
  success: '#047857',
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
        setSnackbar({
          open: true,
          message: 'Session expirée. Reconnectez-vous.',
          severity: 'warning',
        });
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setSnackbar({ open: true, message: "Erreur lors de l'ajout", severity: 'error' });
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

  // ─── PRODUCT CARD PREMIUM ──────────────────────────────────
  const renderProductCard = (produit, index) => {
    if (!produit) return null;

    const imageUrl = produit.image_url || produit.image_principale || heroImage;
    const isFav = favorites.includes(produit.id);
    const isRupture = produit.quantite_stock <= 0;
    const isLowStock = produit.quantite_stock > 0 && produit.quantite_stock < 5;
    const hasPromo = produit.est_en_promotion && produit.prix_promotion && !isRupture;

    return (
      <Grow in timeout={400 + index * 60} key={produit.id}>
        <Card
          elevation={0}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            border: `1px solid ${T.border}`,
            bgcolor: T.surface,
            overflow: 'hidden',
            position: 'relative',
            opacity: isRupture ? 0.72 : 1,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderColor: alpha(T.accent, 0.45),
              boxShadow: `0 24px 48px -16px ${alpha(T.dark, 0.12)}`,
              transform: isRupture ? 'none' : 'translateY(-8px)',
              '& .product-image': {
                transform: isRupture ? 'none' : 'scale(1.05)',
              },
              '& .add-btn': {
                bgcolor: T.accent,
                color: T.dark,
              },
              '& .view-btn': {
                borderColor: T.dark,
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
              bgcolor: '#F3F2EF',
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
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: isRupture ? 'grayscale(0.75) brightness(0.92)' : 'none',
              }}
            />

            {/* Overlay léger en bas pour lisibilité */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '35%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.08), transparent)',
                pointerEvents: 'none',
              }}
            />

            {/* Badge promo */}
            {hasPromo && (
              <Chip
                icon={<LocalOffer sx={{ fontSize: 13, color: `${T.dark} !important` }} />}
                label={`-${Math.round((1 - produit.prix_promotion / produit.prix) * 100)}%`}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  bgcolor: T.accent,
                  color: T.dark,
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  height: 26,
                  borderRadius: 1.5,
                  zIndex: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
            )}

            {/* Badge rupture */}
            {isRupture && (
              <Chip
                icon={<Warning sx={{ fontSize: 13, color: '#fff !important' }} />}
                label="Rupture"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  bgcolor: T.danger,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  height: 26,
                  borderRadius: 1.5,
                  zIndex: 2,
                }}
              />
            )}

            {/* Badge stock faible */}
            {isLowStock && !isRupture && (
              <Chip
                icon={<Warning sx={{ fontSize: 13, color: '#fff !important' }} />}
                label={`Plus que ${produit.quantite_stock}`}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  bgcolor: T.warning,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  height: 26,
                  borderRadius: 1.5,
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
                top: 12,
                right: 12,
                bgcolor: alpha('#FFFFFF', 0.92),
                width: 36,
                height: 36,
                zIndex: 2,
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  bgcolor: '#fff',
                  transform: 'scale(1.1)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                },
              }}
            >
              {isFav ? (
                <Favorite sx={{ color: '#E11D48', fontSize: 18 }} />
              ) : (
                <FavoriteBorder sx={{ color: T.textSecondary, fontSize: 18 }} />
              )}
            </IconButton>
          </Box>

          {/* Infos */}
          <Box
            sx={{
              p: 2.25,
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography
              sx={{
                color: T.accent,
                fontWeight: 600,
                letterSpacing: 1.4,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                mb: 0.75,
              }}
            >
              {CATEGORIES.find((c) => c.id === produit.categorie)?.label || produit.categorie}
            </Typography>

            <Typography
              sx={{
                fontWeight: 500,
                color: isRupture ? T.textMuted : T.textPrimary,
                fontSize: '0.95rem',
                lineHeight: 1.4,
                mb: 1.1,
                fontFamily: '"Playfair Display", "Georgia", serif',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '2.8em',
              }}
            >
              {produit.nom}
            </Typography>

            {/* Étoiles */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35, mb: 1.75 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  sx={{
                    fontSize: 13,
                    color: star <= Math.round(produit.note || 4.5) ? T.accent : T.border,
                  }}
                />
              ))}
              <Typography sx={{ color: T.textMuted, ml: 0.5, fontSize: '0.72rem' }}>
                ({produit.nb_avis || 0})
              </Typography>
            </Box>

            {/* Prix */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 1.1,
                mt: 'auto',
                mb: 1.75,
              }}
            >
              {hasPromo ? (
                <>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: T.textPrimary,
                      fontSize: '1.1rem',
                      letterSpacing: -0.3,
                    }}
                  >
                    {formatPrice(produit.prix_promotion)}
                  </Typography>
                  <Typography
                    sx={{
                      color: T.textMuted,
                      textDecoration: 'line-through',
                      fontSize: '0.82rem',
                    }}
                  >
                    {formatPrice(produit.prix)}
                  </Typography>
                </>
              ) : (
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: isRupture ? T.textMuted : T.textPrimary,
                    fontSize: '1.1rem',
                    letterSpacing: -0.3,
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
                className="view-btn"
                onClick={() => handleDetails(produit.id)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  borderColor: T.border,
                  color: T.textSecondary,
                  py: 1,
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: T.dark,
                    color: T.dark,
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
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  bgcolor: isRupture ? T.border : T.dark,
                  color: isRupture ? T.textMuted : '#fff',
                  py: 1,
                  boxShadow: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
      </Grow>
    );
  };

  // ─── LOADING ────────────────────────────────────────────────
  if (loading && produits.length === 0) {
    return (
      <Box sx={{ bgcolor: T.bg, minHeight: '100vh' }}>
        <Box
          sx={{
            height: { xs: 280, md: 420 },
            bgcolor: T.dark,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(135deg, ${alpha(T.dark, 0.95)} 0%, ${alpha('#2A2A2A', 0.9)} 100%)`,
            }}
          />
        </Box>
        <Container maxWidth="lg" sx={{ py: 7 }}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={item}>
                <Skeleton
                  variant="rectangular"
                  sx={{
                    aspectRatio: '3/4',
                    borderRadius: 3,
                    mb: 1.75,
                    bgcolor: alpha(T.border, 0.6),
                  }}
                />
                <Skeleton width="35%" height={12} sx={{ mb: 0.8, bgcolor: alpha(T.border, 0.5) }} />
                <Skeleton width="85%" height={18} sx={{ mb: 0.8, bgcolor: alpha(T.border, 0.5) }} />
                <Skeleton width="40%" height={16} sx={{ bgcolor: alpha(T.border, 0.5) }} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error && produits.length === 0) {
    return (
      <Box sx={{ bgcolor: T.bg, minHeight: '100vh', py: 14 }}>
        <Container maxWidth="sm">
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={fetchProduits}>
                Réessayer
              </Button>
            }
            sx={{ borderRadius: 2.5, py: 1.5 }}
          >
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh' }}>
      {/* ─── HERO PREMIUM ──────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 320, md: 480 },
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
          bgcolor: T.dark,
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
            objectPosition: 'center 28%',
            opacity: 0.78,
            transform: 'scale(1.02)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `
              linear-gradient(
                to top,
                ${alpha(T.dark, 0.92)} 0%,
                ${alpha(T.dark, 0.55)} 45%,
                ${alpha(T.dark, 0.25)} 100%
              )
            `,
          }}
        />

        {/* Ligne dorée décorative */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 60,
            height: 3,
            bgcolor: T.accent,
            opacity: 0.9,
          }}
        />

        <Container
          maxWidth="lg"
          sx={{
            position: 'relative',
            zIndex: 1,
            pb: { xs: 5.5, md: 8 },
          }}
        >
          <Fade in timeout={800}>
            <Box>
              <Typography
                sx={{
                  color: T.accent,
                  letterSpacing: 5,
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  mb: 1.75,
                }}
              >
                Madame Tibetia
              </Typography>
              <Typography
                sx={{
                  fontWeight: 500,
                  color: '#fff',
                  fontFamily: '"Playfair Display", "Georgia", serif',
                  fontSize: { xs: '2.75rem', md: '4.2rem' },
                  lineHeight: 1.02,
                  mb: 2,
                  letterSpacing: -1.2,
                }}
              >
                Boutique
              </Typography>
              <Typography
                sx={{
                  color: alpha('#FFFFFF', 0.82),
                  fontSize: { xs: '0.95rem', md: '1.15rem' },
                  maxWidth: 440,
                  lineHeight: 1.65,
                  fontWeight: 300,
                  letterSpacing: 0.2,
                }}
              >
                Pièces sélectionnées pour sublimer votre élégance au quotidien
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* ─── CATÉGORIES ────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: T.surface,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              gap: 1.25,
              overflowX: 'auto',
              py: 2.75,
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            <Chip
              label="Tout"
              onClick={() => {
                setSelectedCategorie('all');
                setPage(1);
              }}
              sx={{
                borderRadius: 2,
                fontWeight: selectedCategorie === 'all' ? 600 : 500,
                bgcolor: selectedCategorie === 'all' ? T.dark : '#F4F3F0',
                color: selectedCategorie === 'all' ? '#fff' : T.textSecondary,
                px: 2,
                height: 38,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: selectedCategorie === 'all' ? T.darkSoft : alpha(T.accent, 0.14),
                  color: selectedCategorie === 'all' ? '#fff' : T.textPrimary,
                },
              }}
            />
            {CATEGORIES.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.label}
                onClick={() => {
                  setSelectedCategorie(cat.id);
                  setPage(1);
                }}
                sx={{
                  borderRadius: 2,
                  fontWeight: selectedCategorie === cat.id ? 600 : 500,
                  bgcolor: selectedCategorie === cat.id ? T.dark : '#F4F3F0',
                  color: selectedCategorie === cat.id ? '#fff' : T.textSecondary,
                  px: 2,
                  height: 38,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: selectedCategorie === cat.id ? T.darkSoft : alpha(T.accent, 0.14),
                    color: selectedCategorie === cat.id ? '#fff' : T.textPrimary,
                  },
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* ─── TOOLBAR STICKY ────────────────────────────── */}
      <Box
        sx={{
          bgcolor: alpha(T.surface, 0.92),
          backdropFilter: 'blur(16px)',
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
              py: 2.25,
              gap: 2.5,
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
                maxWidth: { xs: '100%', md: 380 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  bgcolor: '#F7F6F3',
                  fontSize: '0.875rem',
                  transition: 'all 0.25s ease',
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: alpha(T.accent, 0.35) },
                  '&.Mui-focused fieldset': {
                    borderColor: T.accent,
                    borderWidth: 1.5,
                  },
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

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2.25,
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant="outlined"
                startIcon={<Receipt sx={{ fontSize: 17 }} />}
                onClick={() => navigate('/panier')}
                sx={{
                  borderRadius: 2.5,
                  borderColor: T.border,
                  color: T.textPrimary,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  px: 2.25,
                  py: 0.9,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.25s ease',
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
                  fontSize: '0.84rem',
                  display: { xs: 'none', sm: 'block' },
                  fontWeight: 500,
                }}
              >
                {filteredProduits.length} pièce{filteredProduits.length > 1 ? 's' : ''}
              </Typography>

              <FormControl size="small" sx={{ minWidth: 165 }}>
                <Select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  displayEmpty
                  sx={{
                    borderRadius: 2.5,
                    fontSize: '0.84rem',
                    bgcolor: '#F7F6F3',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(T.accent, 0.35),
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: T.accent,
                      borderWidth: 1.5,
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

      {/* ─── GRILLE PRODUITS ───────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        {filteredProduits.length === 0 ? (
          <Box sx={{ py: 14, textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: alpha(T.border, 0.5),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <ShoppingBag sx={{ fontSize: 36, color: T.textMuted }} />
            </Box>
            <Typography
              sx={{
                fontSize: '1.6rem',
                fontWeight: 500,
                color: T.textPrimary,
                mb: 1.25,
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Aucune pièce trouvée
            </Typography>
            <Typography
              sx={{
                color: T.textSecondary,
                mb: 4,
                fontSize: '0.95rem',
                maxWidth: 360,
                mx: 'auto',
              }}
            >
              {searchTerm
                ? 'Essayez un autre mot-clé ou élargissez votre recherche'
                : 'Aucun produit dans cette catégorie pour le moment'}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategorie('all');
                setPage(1);
              }}
              sx={{
                borderRadius: 2.5,
                borderColor: T.dark,
                color: T.dark,
                textTransform: 'none',
                px: 3.5,
                py: 1.1,
                fontWeight: 600,
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
            <Grid container spacing={{ xs: 2.5, md: 3.5 }}>
              {filteredProduits.map((produit, index) => (
                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={produit.id}>
                  {renderProductCard(produit, index)}
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: 2,
                      fontWeight: 500,
                      color: T.textSecondary,
                      minWidth: 38,
                      height: 38,
                      transition: 'all 0.25s ease',
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

      {/* ─── CTA FINAL ─────────────────────────────────── */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          bgcolor: T.dark,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ligne dorée haute */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 70,
            height: 2.5,
            bgcolor: T.accent,
          }}
        />

        <Container maxWidth="sm">
          <Typography
            sx={{
              fontFamily: '"Playfair Display", serif',
              color: '#fff',
              fontSize: { xs: '2rem', md: '2.75rem' },
              fontWeight: 500,
              mb: 2.25,
              letterSpacing: -0.6,
            }}
          >
            L'élégance commence ici
          </Typography>
          <Typography
            sx={{
              color: alpha('#FFFFFF', 0.65),
              mb: 4.5,
              fontSize: '1.05rem',
              fontWeight: 300,
              lineHeight: 1.7,
              maxWidth: 420,
              mx: 'auto',
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
              borderRadius: 2.5,
              px: 4.5,
              py: 1.6,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.92rem',
              boxShadow: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: T.accentHover,
                boxShadow: `0 16px 32px -10px ${alpha(T.accent, 0.55)}`,
                transform: 'translateY(-3px)',
              },
            }}
          >
            Voir les forfaits
          </Button>
        </Container>
      </Box>

      {/* ─── SNACKBAR ──────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            borderRadius: 2.5,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Boutique;