// frontend_public/src/pages/Boutique.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Grid, Card, CardContent, Button, Chip,
  IconButton, TextField, InputAdornment, FormControl, InputLabel, Select,
  MenuItem, CircularProgress, Alert, Pagination, Paper, Skeleton,
  Drawer, useMediaQuery, useTheme, Divider, Badge,
} from '@mui/material';
import {
  ShoppingBag, Search, Close, Star, Favorite, FavoriteBorder,
  Add, Remove, ArrowForward, LocalOffer, Visibility, FilterList,
  Tune,
} from '@mui/icons-material';
import { produitService } from '../services/produitService';
import heroImage from '../assets/images/tibetia.jpeg';

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'robes', label: 'Robes', subtitle: 'Silhouettes élégantes' },
  { id: 'accessoires', label: 'Accessoires', subtitle: 'Détails raffinés' },
  { id: 'chaussures', label: 'Chaussures', subtitle: 'Pas de style' },
  { id: 'bijoux', label: 'Bijoux', subtitle: 'Éclat & finesse' },
  { id: 'sacs', label: 'Sacs', subtitle: 'Pièces signature' },
];

const Boutique = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState([]);
  const [panier, setPanier] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    fetchProduits();
  }, [selectedCategorie, page, sortBy]);

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
      setTotalCount(data.count || produitsList.length || 0);
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

  useEffect(() => {
    const saved = localStorage.getItem('tibetia_panier');
    if (saved) {
      try {
        setPanier(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tibetia_panier', JSON.stringify(panier));
  }, [panier]);

  const toggleFavorite = (id) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const ajouterAuPanier = (id) =>
    setPanier((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

  const retirerDuPanier = (id) =>
    setPanier((prev) => {
      const next = { ...prev };
      if (next[id] > 1) next[id]--;
      else delete next[id];
      return next;
    });

  const handleDetails = (id) => navigate(`/produit/${id}`);

  const getTotalPanier = () => {
    let total = 0;
    let count = 0;
    produits.forEach((p) => {
      if (panier[p.id]) {
        const price = p.prix_promotion || p.prix;
        total += price * panier[p.id];
        count += panier[p.id];
      }
    });
    return { total, count };
  };

  const { total, count } = getTotalPanier();

  const formatPrice = (price) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);

  // ─────────────────────────────────────────────────────────────
  // PRODUCT CARD
  // ─────────────────────────────────────────────────────────────
  const renderProductCard = (produit) => {
    if (!produit) return null;

    const imageUrl = produit.image_url || produit.image_principale || heroImage;
    const isFav = favorites.includes(produit.id);
    const inCart = panier[produit.id] || 0;

    return (
      <Card
        key={produit.id}
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0,
          border: 'none',
          backgroundColor: 'transparent',
          position: 'relative',
          transition: 'opacity 0.25s ease',
          '&:hover': {
            '& .product-image': {
              transform: 'scale(1.03)',
            },
            '& .product-actions': {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
        }}
      >
        {/* Image */}
        <Box
          sx={{
            position: 'relative',
            aspectRatio: '3/4',
            overflow: 'hidden',
            backgroundColor: '#F5F5F5',
            mb: 1.5,
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
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
            }}
          />

          {/* Badge promo */}
          {produit.est_en_promotion && produit.prix_promotion && (
            <Chip
              label={`-${Math.round((1 - produit.prix_promotion / produit.prix) * 100)}%`}
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                backgroundColor: '#111',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 24,
                borderRadius: 0,
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
              backgroundColor: 'rgba(255,255,255,0.9)',
              width: 34,
              height: 34,
              zIndex: 2,
              '&:hover': { backgroundColor: '#fff' },
            }}
          >
            {isFav ? (
              <Favorite sx={{ color: '#111', fontSize: 18 }} />
            ) : (
              <FavoriteBorder sx={{ color: '#555', fontSize: 18 }} />
            )}
          </IconButton>

          {/* Actions rapides (hover) */}
          <Box
            className="product-actions"
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 1.5,
              background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
              display: 'flex',
              gap: 1,
              opacity: { xs: 1, md: 0 },
              transform: { xs: 'none', md: 'translateY(8px)' },
              transition: 'all 0.3s ease',
            }}
          >
            <Button
              fullWidth
              size="small"
              variant="contained"
              onClick={() => handleDetails(produit.id)}
              sx={{
                backgroundColor: '#fff',
                color: '#111',
                borderRadius: 0,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.75rem',
                py: 1,
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#f5f5f5', boxShadow: 'none' },
              }}
            >
              Voir
            </Button>
            <Button
              fullWidth
              size="small"
              variant="contained"
              onClick={() => ajouterAuPanier(produit.id)}
              sx={{
                backgroundColor: '#111',
                color: '#fff',
                borderRadius: 0,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.75rem',
                py: 1,
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#333', boxShadow: 'none' },
              }}
            >
              Ajouter
            </Button>
          </Box>
        </Box>

        {/* Infos */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', px: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: '#888',
              fontWeight: 500,
              letterSpacing: 1,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              mb: 0.5,
            }}
          >
            {CATEGORIES.find((c) => c.id === produit.categorie)?.label || produit.categorie}
          </Typography>

          <Typography
            sx={{
              fontWeight: 500,
              color: '#111',
              fontSize: '0.9rem',
              lineHeight: 1.35,
              mb: 0.75,
              fontFamily: '"Playfair Display", serif',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {produit.nom}
          </Typography>

          {/* Note */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mb: 1 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                sx={{
                  fontSize: 12,
                  color: star <= Math.round(produit.note || 4.5) ? '#111' : '#E0E0E0',
                }}
              />
            ))}
            <Typography sx={{ color: '#999', ml: 0.4, fontSize: '0.7rem' }}>
              ({produit.nb_avis || 0})
            </Typography>
          </Box>

          {/* Prix */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 'auto' }}>
            {produit.est_en_promotion && produit.prix_promotion ? (
              <>
                <Typography sx={{ fontWeight: 600, color: '#111', fontSize: '0.95rem' }}>
                  {formatPrice(produit.prix_promotion)}
                </Typography>
                <Typography
                  sx={{
                    color: '#999',
                    textDecoration: 'line-through',
                    fontSize: '0.8rem',
                  }}
                >
                  {formatPrice(produit.prix)}
                </Typography>
              </>
            ) : (
              <Typography sx={{ fontWeight: 600, color: '#111', fontSize: '0.95rem' }}>
                {formatPrice(produit.prix)}
              </Typography>
            )}
          </Box>

          {/* Quantité dans le panier (mobile / toujours visible si > 0) */}
          {inCart > 0 && (
            <Box
              sx={{
                mt: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#F5F5F5',
                borderRadius: 0,
                px: 1,
                py: 0.5,
              }}
            >
              <IconButton size="small" onClick={() => retirerDuPanier(produit.id)}>
                <Remove sx={{ fontSize: 16 }} />
              </IconButton>
              <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', minWidth: 20, textAlign: 'center' }}>
                {inCart}
              </Typography>
              <IconButton size="small" onClick={() => ajouterAuPanier(produit.id)}>
                <Add sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          )}
        </Box>
      </Card>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────
  if (loading && produits.length === 0) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
        <Box sx={{ height: { xs: 280, md: 420 }, backgroundColor: '#111' }} />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Grid item xs={6} sm={4} md={3} key={item}>
                <Skeleton variant="rectangular" sx={{ aspectRatio: '3/4', mb: 1.5 }} />
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
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', py: 10 }}>
        <Container maxWidth="sm">
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={fetchProduits}>
                Réessayer
              </Button>
            }
            sx={{ borderRadius: 0 }}
          >
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 300, md: 460 },
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
          backgroundColor: '#111',
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
            objectPosition: 'center 25%',
            filter: 'brightness(0.85)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.15) 100%)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pb: { xs: 5, md: 7 } }}>
          <Typography
            variant="overline"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: 4,
              fontWeight: 500,
              fontSize: '0.7rem',
              display: 'block',
              mb: 1.5,
            }}
          >
            MADAME TIBETIA
          </Typography>
          <Typography
            sx={{
              fontWeight: 300,
              color: '#FFF',
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '2.6rem', md: '4rem' },
              lineHeight: 1.05,
              mb: 1.5,
              letterSpacing: -0.5,
            }}
          >
            Boutique
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              fontWeight: 300,
              maxWidth: 380,
              lineHeight: 1.5,
            }}
          >
            Pièces sélectionnées pour sublimer votre élégance au quotidien
          </Typography>
        </Container>
      </Box>

      {/* ─── CATÉGORIES ───────────────────────────────────────── */}
      <Box sx={{ backgroundColor: '#fff', borderBottom: '1px solid #EEE' }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 1, md: 0 },
              overflowX: 'auto',
              py: 0,
              px: { xs: 0, md: 0 },
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            <Button
              onClick={() => {
                setSelectedCategorie('all');
                setPage(1);
              }}
              sx={{
                minWidth: 'auto',
                px: { xs: 2.5, md: 3.5 },
                py: 2.2,
                borderRadius: 0,
                color: selectedCategorie === 'all' ? '#111' : '#777',
                fontWeight: selectedCategorie === 'all' ? 600 : 400,
                fontSize: '0.85rem',
                textTransform: 'none',
                borderBottom: selectedCategorie === 'all' ? '2px solid #111' : '2px solid transparent',
                '&:hover': { backgroundColor: 'transparent', color: '#111' },
              }}
            >
              Tout
            </Button>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                onClick={() => {
                  setSelectedCategorie(cat.id);
                  setPage(1);
                }}
                sx={{
                  minWidth: 'auto',
                  px: { xs: 2.5, md: 3.5 },
                  py: 2.2,
                  borderRadius: 0,
                  color: selectedCategorie === cat.id ? '#111' : '#777',
                  fontWeight: selectedCategorie === cat.id ? 600 : 400,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  borderBottom:
                    selectedCategorie === cat.id ? '2px solid #111' : '2px solid transparent',
                  '&:hover': { backgroundColor: 'transparent', color: '#111' },
                }}
              >
                {cat.label}
              </Button>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ─── TOOLBAR (Search + Sort) ──────────────────────────── */}
      <Box
        sx={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #EEE',
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
              py: 1.8,
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            {/* Search */}
            <TextField
              placeholder="Rechercher une pièce..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{
                flex: 1,
                maxWidth: { xs: '100%', md: 360 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  backgroundColor: '#FAFAFA',
                  fontSize: '0.875rem',
                  '& fieldset': { borderColor: '#E5E5E5' },
                  '&:hover fieldset': { borderColor: '#CCC' },
                  '&.Mui-focused fieldset': { borderColor: '#111' },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#999', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <Close sx={{ fontSize: 16, color: '#999' }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Compteur */}
              <Typography
                sx={{
                  color: '#666',
                  fontSize: '0.85rem',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                {filteredProduits.length} pièce{filteredProduits.length > 1 ? 's' : ''}
              </Typography>

              {/* Sort */}
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  displayEmpty
                  sx={{
                    borderRadius: 0,
                    fontSize: '0.85rem',
                    backgroundColor: '#FAFAFA',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E5E5' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CCC' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#111' },
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

      {/* ─── PRODUITS ─────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {filteredProduits.length === 0 ? (
          <Box sx={{ py: 12, textAlign: 'center' }}>
            <ShoppingBag sx={{ fontSize: 48, color: '#DDD', mb: 2 }} />
            <Typography
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontSize: '1.6rem',
                color: '#111',
                mb: 1,
              }}
            >
              Aucune pièce trouvée
            </Typography>
            <Typography sx={{ color: '#888', mb: 3, fontSize: '0.95rem' }}>
              {searchTerm
                ? 'Essayez un autre mot-clé'
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
                borderRadius: 0,
                borderColor: '#CCC',
                color: '#111',
                textTransform: 'none',
                px: 3,
                '&:hover': { borderColor: '#111', backgroundColor: 'transparent' },
              }}
            >
              Réinitialiser les filtres
            </Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {filteredProduits.map((produit) => (
                <Grid item xs={6} sm={4} md={3} key={produit.id}>
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
                      borderRadius: 0,
                      fontWeight: 500,
                      '&.Mui-selected': {
                        backgroundColor: '#111',
                        color: '#fff',
                        '&:hover': { backgroundColor: '#333' },
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          backgroundColor: '#111',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Typography
            sx={{
              fontFamily: '"Playfair Display", serif',
              color: '#FFF',
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              fontWeight: 300,
              mb: 1.5,
              letterSpacing: -0.3,
            }}
          >
            L'élégance commence ici
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.65)',
              mb: 4,
              fontSize: '1rem',
              fontWeight: 300,
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
              backgroundColor: '#fff',
              color: '#111',
              borderRadius: 0,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#f0f0f0',
                boxShadow: 'none',
              },
            }}
          >
            Voir les forfaits
          </Button>
        </Container>
      </Box>

      {/* ─── PANIER FLOTTANT ──────────────────────────────────── */}
      {count > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            zIndex: 1200,
          }}
        >
          <Button
            component={Link}
            to="/panier"
            variant="contained"
            startIcon={<ShoppingBag sx={{ fontSize: 18 }} />}
            sx={{
              backgroundColor: '#111',
              color: '#fff',
              borderRadius: 0,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              '&:hover': {
                backgroundColor: '#333',
                boxShadow: '0 10px 28px rgba(0,0,0,0.3)',
              },
            }}
          >
            {count} article{count > 1 ? 's' : ''} · {formatPrice(total)}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Boutique;